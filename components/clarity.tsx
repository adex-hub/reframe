import Script from "next/script";

const PROJECT_ID = "z7t6esftso";

/** Microsoft Clarity analytics, production builds only so local dev sessions aren't recorded. */
export function Clarity() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    // Not id="clarity": browsers expose element ids as globals, so window.clarity would be this
    // tag instead of Clarity's function and the snippet would break.
    <Script id="clarity-init">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${PROJECT_ID}");`}
    </Script>
  );
}
