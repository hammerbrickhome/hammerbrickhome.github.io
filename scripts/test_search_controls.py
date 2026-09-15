#!/usr/bin/env python3
"""Exercise CMS search settings in an isolated copy. No network or publishing."""
import json, shutil, tempfile, unittest
from pathlib import Path
import build_search_files as builder

SOURCE = Path(__file__).resolve().parents[1]
class SearchControls(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
  for folder in ('site-data','content','pdfs'):shutil.copytree(SOURCE/folder,self.root/folder)
  (self.root/'admin-tools').mkdir()
  shutil.copy(SOURCE/'gallery.json',self.root/'gallery.json')
  for file in SOURCE.glob('*.html'):shutil.copy(file,self.root/file.name)
  builder.ROOT=self.root
 def tearDown(self):
  builder.ROOT=SOURCE;self.temp.cleanup()
 def change(self,relative,edit):
  p=self.root/relative;data=json.loads(p.read_text());edit(data);p.write_text(json.dumps(data))
 def page(self,edit):
  self.change('site-data/pages.json',lambda d:edit(next(p for p in d['pages'] if p['slug']=='contact')))
 def test_custom_sharing_canonical_and_schema(self):
  self.page(lambda p:p.update(canonicalUrl='/about.html',socialTitle='Sharing & title',socialDescription='Custom sharing description',structuredDataType='service'))
  builder.build();text=(self.root/'contact.html').read_text();head=builder.Head(text)
  self.assertEqual(head.meta['og:title'],'Sharing & title');self.assertEqual(head.meta['twitter:description'],'Custom sharing description')
  self.assertIn('"@type": "Service"',text)
  self.assertNotIn('https://www.hammerbrickhome.com/contact.html',(self.root/'sitemap.xml').read_text())
 def test_default_image_and_verification(self):
  self.change('site-data/seo.json',lambda d:d.update(defaultSocialImage='/images/custom.png',googleVerification='test-code',bingVerification='bing-code'))
  builder.build();head=builder.Head((self.root/'index.html').read_text())
  self.assertEqual(head.meta['google-site-verification'],'test-code');self.assertTrue(head.meta['og:image'].endswith('/images/custom.png'))
  self.assertNotIn('google-site-verification',builder.Head((self.root/'about.html').read_text()).meta)
 def test_noindex_and_sitemap_controls(self):
  for change in ({'allowIndexing':False},{'active':False},{'published':False}):
   self.page(lambda p:p.update(active=True,published=True,allowIndexing=True,**{}));self.page(lambda p:p.update(change));builder.build()
   self.assertIn('noindex',builder.Head((self.root/'contact.html').read_text()).meta['robots'])
   self.assertNotIn('https://www.hammerbrickhome.com/contact.html',(self.root/'sitemap.xml').read_text())
  self.page(lambda p:p.update(active=True,published=True,allowIndexing=True,showInSitemap=False));builder.build()
  self.assertNotIn('noindex',builder.Head((self.root/'contact.html').read_text()).meta['robots'])
  self.assertNotIn('https://www.hammerbrickhome.com/contact.html',(self.root/'sitemap.xml').read_text())
 def test_schema_toggle_and_repeat_build(self):
  self.change('site-data/seo.json',lambda d:d.update(structuredDataEnabled=False));builder.build()
  self.assertNotIn('application/ld+json',(self.root/'index.html').read_text())
  before={p.name:p.read_bytes() for p in self.root.glob('*.html')};builder.build()
  self.assertEqual(before,{p.name:p.read_bytes() for p in self.root.glob('*.html')})
 def test_homepage_visual_order_and_seo_sync(self):
  self.change('site-data/homepage.json',lambda d:d.update(homepageReviewLimit=2,homepageProjectLimit=1,homepageBeforeAfterLimit=2))
  self.change('site-data/reviews.json',lambda d:[item.update(featured=index==1,displayOrder=(index+1)*10,showOnHomepage=True) for index,item in enumerate(d['reviews'][:3])])
  self.change('site-data/projects.json',lambda d:d['projects'][0].update(active=True,publishStatus='live',showOnHomepage=True,title='Test Masonry Project',summary='Repaired and repointed the masonry.',imageAlt='Repointed brick wall after repair',coverImage='/images/test-project.jpg'))
  builder.build();text=(self.root/'index.html').read_text();report=json.loads((self.root/'admin-tools/search-readiness.json').read_text())
  self.assertIn('"@id": "https://www.hammerbrickhome.com/#customer-reviews"',text)
  self.assertIn('"@id": "https://www.hammerbrickhome.com/#featured-projects"',text)
  self.assertIn('"@id": "https://www.hammerbrickhome.com/#before-after-projects"',text)
  self.assertNotIn('"aggregateRating"',text)
  self.assertEqual(report['homepageSeoSync']['reviews'],2)
  self.assertEqual(report['homepageSeoSync']['beforeAfterSets'],2)
  self.assertEqual(report['homepageSeoSync']['projectsEligibleForSchema'],1)
if __name__=='__main__':unittest.main()
