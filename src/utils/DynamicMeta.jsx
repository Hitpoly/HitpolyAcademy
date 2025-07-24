import { useEffect } from "react";

export default function DynamicMeta({ title, description, image, url }) {
  useEffect(() => {
    document.title = title;

    const setMeta = (property, content) => {
      let element =
        document.querySelector(`meta[name='${property}']`) ||
        document.querySelector(`meta[property='${property}']`);
      if (!element) {
        element = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          element.setAttribute("property", property);
        } else {
          element.setAttribute("name", property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:url", url);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
  }, [title, description, image, url]);

  return null;
}
