#!/usr/bin/env python3
"""Local read-only release inspection; no network, deletion, commits or publishing.

python3 scripts/workshop_check.py --root . --output /tmp/hammer-report.json
--refresh-fallback explicitly refreshes only the marked homepage gallery block.
"""
import argparse
import hashlib
import html
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
from xml.etree import ElementTree as ET

BASE = 'https://www.hammerbrickhome.com/'
START, END = '<!-- WORKSHOP GALLERY FALLBACK START -->', '<!-- WORKSHOP GALLERY FALLBACK END -->'


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.title, self.description, self.canonical, self.robots = '', '', '', ''
        self.links, self.images, self.schema, self.ids = [], [], [], set()
        self.tag, self.jsonld, self.buffer, self.duplicates = '', False, '', []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            if a['id'] in self.ids:
                self.duplicates.append(a['id'])
            self.ids.add(a['id'])
        if tag == 'title':
            self.tag = 'title'
        if tag == 'meta':
            if a.get('name', '').lower() == 'description':
                self.description = a.get('content', '')
            if a.get('name', '').lower() == 'robots':
                self.robots = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a.get('href', '')
        if tag in ('img', 'script', 'iframe', 'source') and a.get('src'):
            self.links.append(a['src'])
        if tag in ('a', 'link') and a.get('href'):
            self.links.append(a['href'])
        if tag == 'img' and a.get('src'):
            self.images.append(a)
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.jsonld, self.buffer = True, ''

    def handle_endtag(self, tag):
        if tag == 'title':
            self.tag = ''
        if tag == 'script' and self.jsonld:
            self.schema.append(self.buffer)
            self.jsonld = False

    def handle_data(self, data):
        if self.tag == 'title':
            self.title += data
        if self.jsonld:
            self.buffer += data


def relative_url(value, page='index.html'):
    if not isinstance(value, str) or not value:
        return None
    try:
        u = urlparse(urljoin(BASE + page, value))
        if u.netloc not in ('www.hammerbrickhome.com', 'hammerbrickhome.com') or u.scheme not in ('https', 'http'):
            return None
        p = unquote(u.path).lstrip('/')
        p = p + 'index.html' if not p or p.endswith('/') else p
        if '..' in Path(p).parts or '\\' in p:
            return None
        return p
    except ValueError:
        return None


def refresh_fallback(root):
    index = root / 'index.html'
    source = index.read_text(encoding='utf-8')
    if START not in source or END not in source:
        raise ValueError('Homepage fallback markers missing; no file was changed.')
    gallery = json.loads((root / 'gallery.json').read_text(encoding='utf-8'))
    home = json.loads((root / 'site-data/homepage.json').read_text(encoding='utf-8'))
    limit = max(1, min(30, int(home.get('homepageBeforeAfterLimit', 6))))
    cards = []
    for pair in gallery.get('homePairs', []):
        if pair.get('active') is False or not pair.get('before') or not pair.get('after'):
            continue
        figures = []
        for key in ('before', 'after'):
            src = str(pair[key])
            if src.startswith('images/'):
                src = '/' + src
            elif not src.startswith(('/', 'https://')):
                src = '/images/' + src
            if src.startswith('//') or '\\' in src or '/..' in src:
                continue
            alt = pair.get(key + 'Alt') or key.title() + ': ' + str(pair.get('label', 'Project'))
            figures.append('<figure style="margin:0"><img loading="lazy" width="300" style="max-width:100%;height:auto" src="' + html.escape(src, quote=True) + '" alt="' + html.escape(alt, quote=True) + '"><figcaption>' + key.title() + '</figcaption></figure>')
        if len(figures) == 2:
            cards.append('<article><h3>' + html.escape(str(pair.get('label', 'Project'))) + '</h3><div style="display:flex;gap:12px;flex-wrap:wrap">' + ''.join(figures) + '</div></article>')
        if len(cards) >= limit:
            break
    block = START + '\n<div id="workshopGalleryFallback">\n' + '\n'.join(cards) + '\n</div>\n' + END
    updated = re.sub(re.escape(START) + r'[\s\S]*?' + re.escape(END), lambda _: block, source, count=1)
    if updated != source:
        index.write_text(updated, encoding='utf-8')
    return len(cards)


def inspect(root):
    rows, refs, docs, titles, image_hashes = [], set(), {}, defaultdict(list), defaultdict(list)
    def add(level, path, message):
        rows.append({'level': level, 'path': str(path), 'message': message})
    all_files = [p for p in root.rglob('*') if p.is_file() and not any(x in p.relative_to(root).parts for x in ('.git', 'node_modules', '__pycache__'))]
    paths = {p.relative_to(root).as_posix(): p for p in all_files}
    for rel, path in paths.items():
        if rel.endswith('.json'):
            try:
                value = json.loads(path.read_text(encoding='utf-8'))
                if rel == 'site-data/owner-tools.json':
                    if value.get('version') != 1:
                        add('fail', rel, 'Invalid Workshop settings version.')
                    raw = json.dumps(value)
                    if re.search(r'"(?:documents|document|privateNotes|passphrase|ciphertext)"\s*:', raw):
                        add('fail', rel, 'Private vault fields must not be in public settings.')
                def visit(v, key=''):
                    if isinstance(v, list):
                        for item in v:
                            visit(item, key)
                    elif isinstance(v, dict):
                        if v.get('active') is False or v.get('publishStatus') in ('draft', 'archived'):
                            return
                        for k, item in v.items():
                            visit(item, k)
                    elif isinstance(v, str) and re.search(r'(image|photo|logo|before|after|url|file|backgroundDesktop|backgroundMobile)$', key, re.I):
                        if re.match(r'^[^/]+\.(?:png|jpe?g|webp|avif)$', v, re.I):
                            v = '/images/' + v
                        target = relative_url(v)
                        if target:
                            refs.add(target)
                if not rel.startswith(('admin-tools/', 'reference/')) and not path.name.startswith('_'):
                    visit(value)
            except (ValueError, UnicodeError) as e:
                add('fail', rel, 'Invalid JSON: ' + str(e))
        if rel.endswith('.html'):
            try:
                raw = path.read_text(encoding='utf-8')
                d = Document(raw)
            except (OSError, UnicodeError) as e:
                add('fail', rel, str(e))
                continue
            docs[rel] = d
            for link in d.links:
                target = relative_url(link, rel)
                if target:
                    refs.add(target)
            fragment = not re.search(r'<html\b', raw, re.I)
            if fragment:
                continue
            if not d.title.strip():
                add('fail', rel, 'Missing title.')
            if rel.startswith('admin/'):
                if 'noindex' not in d.robots:
                    add('warn', rel, 'Public admin code should be noindex; this does not authenticate it.')
                continue
            titles[d.title.strip()].append(rel)
            if not d.description:
                add('warn', rel, 'Missing meta description.')
            if not d.canonical:
                add('warn', rel, 'Missing canonical.')
            elif not d.canonical.startswith('https://'):
                add('fail', rel, 'Non-HTTPS canonical.')
            if d.duplicates:
                add('warn', rel, 'Duplicate HTML IDs: ' + ', '.join(d.duplicates))
            for image in d.images:
                if 'alt' not in image:
                    add('warn', rel, 'Image lacks alt: ' + image.get('src', ''))
            for schema in d.schema:
                try:
                    parsed = json.loads(schema)
                    text = json.dumps(parsed)
                    if 'FAQPage' in text:
                        add('warn', rel, 'FAQ rich results are retired; content may remain.')
                    if re.search(r'"(?:Review|AggregateRating)"', text):
                        add('warn', rel, 'Self-serving business reviews do not qualify for Google review stars.')
                except ValueError:
                    add('fail', rel, 'Malformed JSON-LD.')
            if 'PENDING ACTIVATION' in raw:
                add('warn', rel, 'Review pending membership display before activating.')
            if re.search(r'Workers[’\' ]*Comp', raw, re.I):
                add('warn', rel, 'Verify current Workers Comp wording against actual documents.')
        if re.search(r'\.(png|jpe?g|webp|avif)$', rel, re.I):
            size = path.stat().st_size
            if size > 2 * 1024 * 1024:
                add('warn', rel, 'Large image: %.1f MB.' % (size / 1048576))
            image_hashes[hashlib.sha256(path.read_bytes()).hexdigest()].append(rel)
    for target in sorted(refs):
        if target not in paths:
            add('fail', target, 'Referenced file missing; check folder, capitalization, or extensionless hosting route.')
    for title, pages in titles.items():
        if title and len(pages) > 1:
            add('warn', ', '.join(pages), 'Duplicate title: ' + title)
    for group in image_hashes.values():
        if len(group) > 1:
            add('info', group[0], 'Byte-identical image copies: ' + ', '.join(group[1:]) + '. No files deleted.')
    sitemap = root / 'sitemap.xml'
    try:
        xml = ET.parse(sitemap)
        for loc in xml.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
            target = relative_url(loc.text)
            if target not in paths:
                add('fail', 'sitemap.xml', 'Missing page: ' + str(loc.text))
            elif target in docs and 'noindex' in docs[target].robots:
                add('fail', target, 'Sitemap contains noindex page.')
    except (OSError, ET.ParseError) as e:
        add('fail', 'sitemap.xml', str(e))
    robots = paths.get('robots.txt')
    if not robots:
        add('warn', 'robots.txt', 'Missing robots.txt.')
    elif re.search(r'Disallow:\s*/\s*$', robots.read_text(), re.M | re.I):
        add('warn', 'robots.txt', 'Root disallow found; check user-agent scope.')
    try:
        import yaml
        for rel in [p for p in paths if p == '.pages.yml' or p.startswith('.github/workflows/') and p.endswith(('.yml', '.yaml'))]:
            try:
                parsed = yaml.safe_load(paths[rel].read_text(encoding='utf-8'))
                if not isinstance(parsed, dict):
                    add('fail', rel, 'YAML must contain a mapping.')
                if rel == '.pages.yml':
                    def editors(items):
                        for item in items or []:
                            if item.get('type') == 'group':
                                yield from editors(item.get('items', []))
                            elif item.get('type') == 'file' and item.get('path'):
                                yield item['path']
                    for target in editors(parsed.get('content', [])):
                        if target not in paths:
                            add('fail', rel, 'CMS editor references missing file: ' + target)
            except (yaml.YAMLError, ValueError, AttributeError) as e:
                add('fail', rel, 'Invalid YAML/config: ' + str(e))
    except ImportError:
        add('info', '.pages.yml', 'YAML syntax not checked; install PyYAML for CMS/workflow validation.')
    return {'format': 'hammer-workshop-inspection-1', 'createdAt': datetime.now(timezone.utc).isoformat(), 'source': 'local repository', 'files': len(paths), 'pages': len(docs), 'paths': len(refs), 'summary': {level: sum(r['level'] == level for r in rows) for level in ('fail', 'warn', 'info')}, 'results': rows, 'limits': 'Read-only local checks, not a full security audit, real-device test or live Google indexing report.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--refresh-fallback', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    if not (root / 'index.html').is_file():
        parser.error('Select the full website root containing index.html.')
    if args.refresh_fallback:
        print('Refreshed %d fallback cards.' % refresh_fallback(root))
    report = inspect(root)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: report[k] for k in ('files', 'pages', 'paths', 'summary')}, indent=2))
    return 1 if report['summary']['fail'] else 0


if __name__ == '__main__':
    sys.exit(main())
