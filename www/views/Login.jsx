import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  OAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/www/store/context-provider";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyAuthed, setAlreadyAuthed] = useState(false);
  const navigatedRef = useRef(false);

  const inlineStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    :root {
      --swiss-red: #FF0000;
      --swiss-black: #000000;
      --swiss-white: #FFFFFF;
      --swiss-gray-200: #E5E5E5;
      --swiss-gray-400: #A3A3A3;
      --swiss-gray-500: #737373;
      --swiss-gray-600: #525252;
    }
    .login-root, .login-root * { font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif; }
    .min-h-screen { min-height: 100vh; }
    .bg-swiss-white { background-color: var(--swiss-white); }
    .bg-swiss-black { background-color: var(--swiss-black); }
    .text-swiss-white { color: var(--swiss-white); }
    .text-swiss-black { color: var(--swiss-black); }
    .text-swiss-red { color: var(--swiss-red); }
    .text-swiss-gray-600 { color: var(--swiss-gray-600); }
    .text-swiss-gray-500 { color: var(--swiss-gray-500); }
    .text-swiss-gray-400 { color: var(--swiss-gray-400); }
    .border-swiss-gray-200 { border-color: var(--swiss-gray-200); }
    .border-swiss-red { border-color: var(--swiss-red); }
    .bg-swiss-red-10 { background-color: rgba(255,0,0,0.1); }
    .flex { display: flex; }
    .inline-flex { display: inline-flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .text-center { text-align: center; }
    .p-6 { padding: 1.5rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-3 { padding-top: .75rem; padding-bottom: .75rem; }
    .mt-16 { margin-top: 4rem; }
    .pt-8 { padding-top: 2rem; }
    .mb-12 { margin-bottom: 3rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mr-3 { margin-right: .75rem; }
    .space-y-8 > * + * { margin-top: 2rem; }
    .space-y-2 > * + * { margin-top: .5rem; }
    .space-x-3 > * + * { margin-left: .75rem; }
    .w-full { width: 100%; }
    .max-w-md { max-width: 28rem; }
    .w-16 { width: 4rem; }
    .h-16 { height: 4rem; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-xs { font-size: .75rem; line-height: 1rem; }
    .text-sm { font-size: .875rem; line-height: 1.25rem; }
    .font-bold { font-weight: 700; }
    .font-light { font-weight: 300; }
    .font-medium { font-weight: 500; }
    .tracking-tight { letter-spacing: -0.02em; }
    .tracking-wide { letter-spacing: 0.05em; }
    .uppercase { text-transform: uppercase; }
    .border-2 { border-width: 2px; border-style: solid; }
    .border-l-4 { border-left-width: 4px; border-style: solid; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .hairline { border-top: 0.5px solid rgba(0,0,0,0.08); }
    .group {}
    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideDown { from { transform: translateY(-10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    .spinner-swiss {
      width: 16px; height: 16px; border: 2px solid var(--swiss-gray-200);
      border-top-color: var(--swiss-black); border-radius: 9999px;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn-swiss-login {
      width: 100%; display: flex; align-items: center; justify-content: center;
      padding: 1rem 1.5rem; border: 2px solid var(--swiss-black);
      background: var(--swiss-white); color: var(--swiss-black); font-weight: 500;
      transition: all .2s ease-in-out; cursor: pointer;
    }
    .btn-swiss-login:hover { background: var(--swiss-black); color: var(--swiss-white); }
    .btn-swiss-login:disabled { opacity: .4; cursor: not-allowed; }
    .tracking-wider { letter-spacing: 0.1em; }
    .no-wrap { white-space: nowrap; }
    .title-row { display: inline-flex; align-items: baseline; gap: .75rem; overflow: visible; }
    .login-footer { border: 0 !important; border-top: 1px solid var(--swiss-gray-200) !important; background: transparent; box-shadow: none; }
  `;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setAlreadyAuthed(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (alreadyAuthed && !navigatedRef.current) {
      navigatedRef.current = true;
      navigate("/loader/ifc/file", { replace: true });
    }
  }, [alreadyAuthed, navigate]);

  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      if (!alreadyAuthed) {
        const provider = new OAuthProvider("microsoft.com");
        provider.addScope("offline_access");
        provider.addScope("openid");
        provider.addScope("profile");
        provider.addScope("email");
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      console.error("Microsoft sign-in error:", e);
      setError(
        "Erreur lors de la connexion avec Microsoft. Veuillez réessayer."
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-root min-h-screen bg-swiss-white flex items-center justify-center p-6">
      <style>{inlineStyles}</style>
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-swiss-white">
          <div className="mb-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-swiss-black mb-6">
                <span className="text-swiss-white text-2xl font-bold">
                  IFC
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tight text-swiss-black mb-2">
                IFC to Metrics
              </h1>
            </div>
            <p className="text-sm text-swiss-gray-600 uppercase">
              Métrés intéligents sur les modèles IFC
            </p>
          </div>

          <div>
            {error && (
              <div className="border-l-4 border-swiss-red px-4 py-3 animate-slide-down">
                <p className="text-sm text-swiss-red font-medium">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <button
                className="btn-swiss-login"
                onClick={handleMicrosoftSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z" />
                  <path fill="#7FBA00" d="M24 11.4H12.6V0H24v11.4z" />
                  <path fill="#00A4EF" d="M11.4 24H0V12.6h11.4V24z" />
                  <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z" />
                </svg>
                <span className="text-sm">Connexion avec Microsoft</span>
              </button>
            </div>

            {loading && (
              <div className="text-center py-6 animate-fade-in">
                <div className="inline-flex items-center">
                  <div className="spinner-swiss"></div>
                  <span
                    className="text-sm text-swiss-gray-600"
                    style={{ marginLeft: 8 }}
                  >
                    Connexion en cours...
                  </span>
                </div>
              </div>
            )}

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full hairline"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-swiss-white text-xs text-swiss-gray-500 uppercase">
                  Authentification sécurisée
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-swiss-gray-400">
                Pour obtenir l'accès, contactez l'administrateur
              </p>
            </div>
          </div>

          <div
            className="mt-16"
            style={{
              borderTop: "1px solid var(--swiss-gray-200)",
              textAlign: "center",
              paddingTop: 32,
            }}
          >
            <p className="text-xs text-swiss-gray-500">
              © 2020 | Créé par Sergio Cera
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
