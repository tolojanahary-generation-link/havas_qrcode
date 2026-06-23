// import qrImage from "@/assets/images/qr-dashboard.png";

export default function AuthIllustration() {
  return (
    <div
      className="
bg-black
text-white
flex
flex-col
justify-center
px-16
"
    >
      {/* <img src={qrImage} className="w-[420px] mb-10" /> */}

      <h1
        className="
text-4xl
font-bold
mb-5
"
      >
        Havas Factory QR Studio
      </h1>

      <p
        className="
text-lg
text-gray-300
"
      >
        Créez, personnalisez et suivez vos QR codes depuis une plateforme
        unique.
      </p>

      <div className="mt-8 space-y-3">
        <p>✓ Génération illimitée de QR codes</p>

        <p>✓ QR dynamiques avec tracking</p>

        <p>✓ Gestion par dossiers clients</p>

        <p>✓ Personnalisation avec votre identité</p>
      </div>
    </div>
  );
}
