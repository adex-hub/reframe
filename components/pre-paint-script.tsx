"use client";

/**
 * An inline script that runs while the browser is still reading the HTML, before the first paint
 * (for things that must be settled before anything is drawn).
 *
 * The server renders it as a normal script, which the browser runs as it parses the page. React
 * never runs scripts it renders in the browser (and warns about them), so there it's marked as
 * inert data: the server's copy has already done its job by then.
 */
export function PrePaintScript({ code }: { code: string }) {
  return (
    <script
      type={typeof window === "undefined" ? undefined : "text/plain"}
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
