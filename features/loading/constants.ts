/** Set once the intro loader has played on this device; after that, visits open straight on the game. */
export const INTRO_SEEN_KEY = "reframe:intro-seen";

/**
 * Runs in <head> while the HTML is still being read, before anything is drawn: on a return visit it
 * marks <html>, and CSS hides the loader, so it never even flashes. (React can only remove the
 * loader after the page starts up, which is too late.)
 */
export const INTRO_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)}))document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;
