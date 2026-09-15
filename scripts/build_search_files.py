#!/usr/bin/env python3
"""Build crawler-readable metadata from CMS data. No network calls or publishing."""
import json
import re
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
def read(name):
    return json.loads((ROOT / name).read_text())
class Head(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta = {}; self.title = ''; self.in_title = False; self.images = []; self.missing_alt = []; self.h1_count = 0
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta': self.meta[a.get('name', a.get('property', ''))] = a.get('content', '')
        if tag == 'title': self.in_title = True
        if tag == 'img' and a.get('src'): self.images.append(a['src'])
        if tag == 'img' and 'alt' not in a: self.missing_alt.append(a.get('src', 'unknown image'))
        if tag == 'h1': self.h1_count += 1
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
    def handle_data(self, text):
        if self.in_title: self.title += text

def build():
    business = read('site-data/business.json'); seo = read('site-data/seo.json')
    base = business['website'].rstrip('/') + '/'
    assert urlsplit(base).scheme == 'https', 'Website must use HTTPS'
    records = {p['slug']: dict(p) for p in read('site-data/pages.json')['pages']}
    for area in read('site-data/areas.json')['areas']:
        detail = ROOT / 'content/areas' / (area['slug'] + '.json')
        records[area['slug']] = {**area, **(json.loads(detail.read_text()) if detail.exists() else {})}
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'; ins = 'http://www.google.com/schemas/sitemap-image/1.1'
    ET.register_namespace('', ns); ET.register_namespace('image', ins)
    sitemap = ET.Element('{%s}urlset' % ns); report = []
    for path in sorted(ROOT.glob('*.html')):
        text = path.read_text(); head = Head(text)
        if not re.search(r'<head[\s>]', text, re.I): continue
        slug = 'home' if path.name == 'index.html' else path.stem
        # Keep key visible homepage copy in the delivered HTML for non-JS readers.
        if slug == 'home':
            home = read('site-data/homepage.json')
            fields = {'homeHeroTitle':'heroTitle','homeHeroText':'heroText','tierHeading':'tierHeading','tierText':'tierText','processHeading':'processHeading','beforeAfterHeading':'beforeAfterHeading','beforeAfterNote':'beforeAfterNote','guaranteeTitle':'guaranteeTitle','guaranteeText':'guaranteeText','whyNeighborsTitle':'whyNeighborsTitle','whyNeighborsText':'whyNeighborsText','reviewHeading':'reviewHeading','reviewIntro':'reviewIntro','serviceAreaHeading':'serviceAreaHeading','serviceAreaIntro':'serviceAreaIntro'}
            for element, key in fields.items():
                if home.get(key):
                    pattern = r'(<(?P<tag>h[1-6]|p|div|span)\b[^>]*\bid="' + re.escape(element) + r'"[^>]*>).*?(</(?P=tag)>)'
                    text = re.sub(pattern, lambda m: m.group(1) + escape(str(home[key])) + m.group(3), text, count=1, flags=re.S)
        item = records.get(slug, {})
        route = '/' if slug == 'home' else '/' + path.name
        own_url = urljoin(base, route)
        canonical = urljoin(base, item.get('canonicalUrl') or route)
        parsed_canonical = urlsplit(canonical)
        if parsed_canonical.scheme not in ('http', 'https') or not parsed_canonical.netloc:
            raise ValueError('Invalid canonical URL for ' + path.name)
        canonical = parsed_canonical._replace(fragment='').geturl()
        title = item.get('seoTitle') or head.title
        description = item.get('seoDescription') or head.meta.get('description', '')
        indexed = all(item.get(k) is not False for k in ('active', 'published', 'allowIndexing')) and item.get('status', 'live') == 'live'
        if not item and 'noindex' in head.meta.get('robots', ''): indexed = False
        image = urljoin(base, item.get('socialImage') or seo['defaultSocialImage'])
        org = {'@type':'Organization','@id':base+'#organization','name':business['businessName'],'url':base,'telephone':business['phone'],'email':business['email'],'areaServed':business['serviceAreas'],'sameAs':[business[k] for k in ('facebook','instagram','youtube') if business.get(k)]}
        website = {'@type':'WebSite','@id':base+'#website','url':base,'name':seo['siteName'],'publisher':{'@id':base+'#organization'}}
        page = {'@type':{'about':'AboutPage','contact':'ContactPage','gallery':'CollectionPage'}.get(slug,'WebPage'),'@id':canonical+'#webpage','url':canonical,'name':title,'description':description,'isPartOf':{'@id':base+'#website'},'about':{'@id':base+'#organization'},'inLanguage':'en-US'}
        graph = [org, website, page]
        if slug != 'home' and seo.get('breadcrumbsEnabled', True):
            graph.append({'@type':'BreadcrumbList','@id':canonical+'#breadcrumb','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':base},{'@type':'ListItem','position':2,'name':item.get('menuLabel') or item.get('name') or slug.replace('-',' ').title(),'item':canonical}]})
            page['breadcrumb'] = {'@id':canonical+'#breadcrumb'}
        schema_type = item.get('structuredDataType', 'auto')
        if schema_type in ('service', 'area') or (schema_type == 'auto' and slug in {'masonry','kitchens','bathrooms','painting','windows-doors','waterproofing','staten-island','brooklyn','queens','manhattan','bronx','new-jersey'}):
            graph.append({'@type':'Service','@id':canonical+'#service','name':item.get('heroTitle') or title,'description':description,'url':canonical,'provider':{'@id':base+'#organization'},'areaServed':item.get('name') or business['serviceAreas']})
            page['mainEntity'] = {'@id':canonical+'#service'}
        text = re.sub(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>', '', text, flags=re.I|re.S)
        text = re.sub(r'<title\b[^>]*>.*?</title>', '', text, flags=re.I|re.S)
        def remove_meta(match):
            parsed = Head(match.group(0))
            keys = set(parsed.meta)
            return '' if keys & {'description','robots','google-site-verification','msvalidate.01'} or any(k.startswith(('og:','twitter:')) for k in keys) else match.group(0)
        text = re.sub(r'<meta\b[^>]*>', remove_meta, text, flags=re.I)
        text = re.sub(r'<link\b[^>]*rel=["\']canonical["\'][^>]*>', '', text, flags=re.I)
        robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' if indexed else 'noindex, follow'
        tags = ['<title>'+escape(title)+'</title>', '<link rel="canonical" href="'+escape(canonical, quote=True)+'">']
        social_title = item.get('socialTitle') or title
        social_description = item.get('socialDescription') or description
        metas = {'description':description,'robots':robots,'og:type':'website','og:site_name':seo['siteName'],'og:title':social_title,'og:description':social_description,'og:url':canonical,'og:image':image,'twitter:card':'summary_large_image','twitter:title':social_title,'twitter:description':social_description,'twitter:image':image}
        if slug == 'home':
            for key, field in [('google-site-verification','googleVerification'),('msvalidate.01','bingVerification')]:
                if seo.get(field): metas[key] = seo[field]
        tags += ['<meta '+('property' if key.startswith('og:') else 'name')+'="'+key+'" content="'+escape(value,quote=True)+'">' for key,value in metas.items()]
        if seo.get('structuredDataEnabled', True): tags.append('<script id="searchStructuredData" type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')+'</script>')
        text = text.replace('</head>', '\n'+'\n'.join(tags)+'\n</head>', 1)
        # Collapse whitespace left by replaced metadata so repeat builds stay stable.
        text = re.sub(r'\n[ \t]*\n(?:[ \t]*\n)+', '\n\n', text)
        path.write_text(text)
        include = indexed and item.get('showInSitemap', True) and canonical == own_url
        if include:
            node = ET.SubElement(sitemap, '{%s}url'%ns); ET.SubElement(node,'{%s}loc'%ns).text = canonical
            for src in list(dict.fromkeys(head.images))[:20]:
                local = ROOT / urlsplit(src).path.lstrip('/')
                if not urlsplit(src).netloc and local.is_file():
                    im = ET.SubElement(node,'{%s}image'%ins); ET.SubElement(im,'{%s}loc'%ins).text = urljoin(base,src)
        warnings = []
        if not title.strip(): warnings.append('Missing title')
        if not description.strip(): warnings.append('Missing description')
        if head.h1_count != 1: warnings.append('Expected one main heading; found ' + str(head.h1_count))
        if head.missing_alt: warnings.append(str(len(head.missing_alt)) + ' images missing an alt attribute')
        if canonical != own_url: warnings.append('Canonical points elsewhere; excluded from sitemap')
        report.append({'file':path.name,'title':title,'description':description,'canonical':canonical,'indexable':indexed,'sitemap':bool(include),'schemaTypes':[g['@type'] for g in graph] if seo.get('structuredDataEnabled',True) else [],'warnings':warnings})
    for item in read('site-data/downloads.json').get('downloads',[]):
        file = item.get('file','')
        if file and item.get('active') is not False and (ROOT/file.lstrip('/')).is_file():
            node=ET.SubElement(sitemap,'{%s}url'%ns); ET.SubElement(node,'{%s}loc'%ns).text=urljoin(base,file)
    ET.indent(sitemap)
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(sitemap,encoding='unicode')+'\n')
    (ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+base+'sitemap.xml\n')
    for page in report:
        for key in ('title','description'):
            matches = [other['file'] for other in report if other['file'] != page['file'] and other[key] and other[key] == page[key] and other['indexable']]
            if page['indexable'] and matches: page['warnings'].append('Duplicate ' + key + ': ' + ', '.join(matches))
    project_issues = []
    for number, project in enumerate(read('site-data/projects.json').get('projects', []), 1):
        if project.get('active') is False or project.get('publishStatus', 'live') != 'live': continue
        if not project.get('title'): project_issues.append('Project ' + str(number) + ': missing project title')
        if not project.get('imageAlt'): project_issues.append('Project ' + str(number) + ': add a descriptive photo alt text')
        if not project.get('summary'): project_issues.append('Project ' + str(number) + ': add an accurate description of the work')
    (ROOT/'admin-tools/search-readiness.json').write_text(json.dumps({'pages':report,'projectWarnings':project_issues,'note':'Local validation only. Indexing, rich results and voice-assistant placement are unverified. Organization and Service markup do not guarantee a Google rich-result feature.'},indent=2)+'\n')
    print('Built metadata for',len(report),'pages;',len(sitemap),'sitemap URLs. No network actions.')

if __name__ == '__main__': build()
