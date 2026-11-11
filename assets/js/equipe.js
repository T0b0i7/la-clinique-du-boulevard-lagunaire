/*-----------------------------------*\
  #EQUIPE JS : interactions du module
  "Credibilite et reassurance medicale"
\*-----------------------------------*/

/**
 * menu mobile
 */

const burger = document.getElementById('burger');
const navMobile = document.getElementById('nav-mobile');

burger?.addEventListener('click', () => {
  const ouvert = navMobile.classList.toggle('ouvert');
  burger.setAttribute('aria-expanded', String(ouvert));
});

navMobile?.querySelectorAll('a').forEach((lien) => {
  lien.addEventListener('click', () => {
    navMobile.classList.remove('ouvert');
    burger.setAttribute('aria-expanded', 'false');
  });
});





/**
 * apparition des blocs au scroll
 */

const cibles = document.querySelectorAll('.aux-scroll');

if (cibles.length && 'IntersectionObserver' in window) {
  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) {
        entree.target.classList.add('visible');
        observateur.unobserve(entree.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  cibles.forEach((cible) => observateur.observe(cible));
} else {
  cibles.forEach((cible) => cible.classList.add('visible'));
}





/**
 * galerie du plateau technique
 *
 * chaque espace possede un fond dedie, une icone,
 * une description et une fiche technologique.
 */

const DECORS = {
  labo: {
    titre: "Laboratoire d'analyses biomédicales",
    texte:
      "Notre laboratoire réalise sur place les analyses courantes et spécialisées, dont l'électrophorèse de l'hémoglobine. Les prélèvements sont traités avec rigueur, du recueil jusqu'à la remise des résultats.",
    tags: ["Électrophorèse de l'hémoglobine", "Hématologie complète", "Biochimie sanguine", "Sérologies"],
    couleurA: "hsl(213, 60%, 30%)",
    couleurB: "hsl(213, 55%, 45%)",
    icone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="hsl(0,0%,100%)" stroke-width="1.2" stroke-linecap="round"><path d="M10 2v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8V2M8 2h8M7 15h10"/></svg>'
  },
  salle: {
    titre: "Salles de soins équipées",
    texte:
      "Nos salles de consultation et de soins sont aménagées pour garantir hygiène, confort et intimité. Le matériel d'examen est entretenu selon un protocole de contrôle régulier.",
    tags: ["Salles de consultation", "Salle de pansement", "Surveillance continue", "Hygiène contrôlée"],
    couleurA: "hsl(146, 22%, 34%)",
    couleurB: "hsl(146, 20%, 48%)",
    icone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="hsl(0,0%,100%)" stroke-width="1.2" stroke-linecap="round"><path d="M4 8h16v12H4zM4 16h16M8 8V4h8v4M12 12v2"/></svg>'
  },
  cour: {
    titre: "Cour spacieuse et cadre aéré",
    texte:
      "La cour de la clinique offre un espace d'accueil et d'attente généreux, ombragé et bien ventilé. Un cadre apaisant, salué par les patients pour sa propreté et son organisation.",
    tags: ["Espace d'attente large", "Circulation fluide", "Cadre arboré", "Accès véhicules"],
    couleurA: "hsl(211, 55%, 38%)",
    couleurB: "hsl(210, 50%, 55%)",
    icone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="hsl(0,0%,100%)" stroke-width="1.2" stroke-linecap="round"><path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6"/></svg>'
  },
  urgence: {
    titre: "Permanence médicale 24h/24",
    texte:
      "Une équipe de garde assure la continuité des soins, jour et nuit, toute l'année. Urgences médicales, consultations de nuit et hospitalisations : la clinique ne ferme jamais.",
    tags: ["Garde 24h/24", "7j/7", "Urgences adultes", "Contact direct 01 94 46 52 52"],
    couleurA: "hsl(213, 65%, 18%)",
    couleurB: "hsl(213, 60%, 32%)",
    icone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="hsl(0,0%,100%)" stroke-width="1.2" stroke-linecap="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4l3 2"/></svg>'
  },
  acces: {
    titre: "Accessibilité et stationnement",
    texte:
      "L'entrée principale et le parking sont aménagés pour accueillir les personnes en fauteuil roulant. Les cheminements restent larges, plans et sans obstacle.",
    tags: ["Entrée PMR", "Parking accessible", "Cheminement sans marche", "Accueil accompagné"],
    couleurA: "hsl(146, 25%, 26%)",
    couleurB: "hsl(146, 22%, 42%)",
    icone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="hsl(0,0%,100%)" stroke-width="1.2" stroke-linecap="round"><circle cx="12" cy="5" r="2.5"/><path d="M12 8v6l5 5M12 12h4M9 11a5.5 5.5 0 1 0 4 9"/></svg>'
  }
};

const navGalerie = document.querySelector('.galerie-nav');
const vitrine = document.getElementById('vitrine');
const vitrineFiche = document.getElementById('vitrine-fiche');
const vitrineDecor = document.getElementById('vitrine-decor');

function afficherVitrine(cle) {
  const decor = DECORS[cle];
  if (!decor) return;

  vitrine.style.background = `linear-gradient(150deg, ${decor.couleurA}, ${decor.couleurB})`;
  vitrineDecor.innerHTML = decor.icone;

  vitrineFiche.innerHTML =
    `<h3>${decor.titre}</h3>
     <p>${decor.texte}</p>
     <div class="fiche-tech">${decor.tags.map((t) => `<span>${t}</span>`).join('')}</div>`;

  /* relance l'animation de la fiche */

  vitrineFiche.style.animation = 'none';
  void vitrineFiche.offsetWidth;
  vitrineFiche.style.animation = '';
}

navGalerie?.querySelectorAll('button').forEach((bouton) => {
  bouton.addEventListener('click', () => {
    navGalerie.querySelectorAll('button').forEach((b) => {
      b.classList.remove('actif');
      b.setAttribute('aria-selected', 'false');
    });
    bouton.classList.add('actif');
    bouton.setAttribute('aria-selected', 'true');
    afficherVitrine(bouton.dataset.vitrine);
  });
});

if (vitrine) afficherVitrine('labo');





/**
 * filtre des prises en charge
 */

const filtreChips = document.getElementById('filtre-prises');
const cartesPrise = document.querySelectorAll('.prise-carte');

filtreChips?.querySelectorAll('button').forEach((chip) => {
  chip.addEventListener('click', () => {
    filtreChips.querySelectorAll('button').forEach((c) => c.classList.remove('actif'));
    chip.classList.add('actif');

    const categorie = chip.dataset.categorie;

    cartesPrise.forEach((carte) => {
      const visible = categorie === 'tous' || carte.dataset.categorie === categorie;
      carte.classList.toggle('cachee', !visible);
    });
  });
});
