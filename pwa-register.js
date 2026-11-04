(function () {
  if (!("serviceWorker" in navigator)) return;
  const isSecure = window.isSecureContext || location.hostname === "localhost";
  if (!isSecure) return;

  window.SiddhaPWA = window.SiddhaPWA || {};
  window.SiddhaPWA.registration = navigator.serviceWorker
    .register("/service-worker.js", { scope: "/" })
    .then(registration => {
      window.SiddhaPWA.ready = registration;
      window.dispatchEvent(new CustomEvent("siddha-pwa-ready", { detail: registration }));
      return registration;
    })
    .catch(error => {
      console.warn("Siddha Astro offline support could not be enabled:", error);
      window.dispatchEvent(new CustomEvent("siddha-pwa-error", { detail: error }));
      return null;
    });

  let installPrompt = null;
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    window.dispatchEvent(new Event("siddha-pwa-install-available"));
  });

  window.SiddhaPWA.promptInstall = async function () {
    if (!installPrompt) return { outcome: "unavailable" };
    const prompt = installPrompt;
    installPrompt = null;
    await prompt.prompt();
    return await prompt.userChoice;
  };
})();
