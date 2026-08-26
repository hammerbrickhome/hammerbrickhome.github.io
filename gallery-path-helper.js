/* Hammer Brick & Home — gallery image path normalizer
   Supports BOTH legacy gallery.json values like "photo.jpg"
   and CMS values like "/images/photo.jpg". */
(function (global) {
  function galleryImageUrl(value) {
    if (!value) return "";
    const src = String(value).trim();
    if (!src) return "";
    if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
    if (src.startsWith("/images/")) return src;
    if (src.startsWith("images/")) return "/" + src;
    return "/images/" + src.replace(/^\/+/, "");
  }
  global.galleryImageUrl = galleryImageUrl;
})(window);
