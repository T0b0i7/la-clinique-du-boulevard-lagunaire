/*-----------------------------------*\
  #ELECTROPHORESE JS : simulateur de
  compatibilite genetique de l'hemoglobine
\*-----------------------------------*/

/**
 * donnees genetiques
 *
 * chaque genotype correspond a deux alleles : A (normale),
 * S (drepanocytaire) ou C (hemoglobine C).
 * statut possible : sain, porteur ou risque.
 */

const ORDRE_ALLELES = ['A', 'S', 'C'];

const GENOTYPES = {

  AA: {
    alleles: ['A', 'A'],
    statut: 'sain',
    etiquette: 'Enfant sain. Hémoglobine normale.',
    clinique:
      "L'enfant reçoit un allèle A de chaque parent. Son hémoglobine est entièrement de type A, le profil de la grande majorité de la population. Il ne développera ni drépanocytose ni hémoglobinose C. Aucune surveillance particulière n'est nécessaire.",
    transmission:
      "À l'âge adulte, cet enfant transmettra uniquement l'allèle A à sa propre descendance."
  },

  AS: {
    alleles: ['A', 'S'],
    statut: 'porteur',
    etiquette: 'Porteur sain du trait drépanocytaire.',
    clinique:
      "L'enfant porte un allèle A et un allèle S. La grande majorité des porteurs AS vivent une vie parfaitement normale, sans maladie. Des précautions s'imposent seulement dans des situations extrêmes, comme une déshydratation sévère, une exposition à l'altitude ou un effort physique intense en climat très chaud.",
    transmission:
      "À l'âge adulte, l'enfant peut transmettre l'allèle S à sa propre descendance. Si son partenaire est lui aussi porteur, un risque de drépanocytose réapparaît chez leurs enfants."
  },

  AC: {
    alleles: ['A', 'C'],
    statut: 'porteur',
    etiquette: 'Porteur sain du trait hémoglobine C.',
    clinique:
      "L'enfant porte un allèle A et un allèle C. Le trait AC est silencieux : il ne provoque aucune maladie et ne nécessite aucun traitement. Une simple information génétique à conserver dans le dossier de santé.",
    transmission:
      "À l'âge adulte, l'enfant peut transmettre l'allèle C à sa propre descendance. La combinaison avec un partenaire porteur de S ou de C crée alors un risque d'hémoglobinose."
  },

  SS: {
    alleles: ['S', 'S'],
    statut: 'risque',
    etiquette: 'Risque de drépanocytose majeure.',
    clinique:
      "L'enfant reçoit un allèle S de chaque parent. Il développera la drépanocytose majeure, aussi appelée anémie falciforme : des globules rouges rigides et déformés qui bloquent les vaisseaux. La vie quotidienne comprend des crises douloureuses vaso-occlusives, une anémie chronique et une sensibilité accrue aux infections. Un suivi hématologique régulier, une hydratation rigoureuse et un accès rapide aux soins urgents transforment le pronostic. Avec une prise en charge adaptée, de nombreux patients mènent une vie active et épanouie.",
    transmission:
      "À l'âge adulte, l'enfant transmettra systématiquement l'allèle S à sa propre descendance."
  },

  SC: {
    alleles: ['S', 'C'],
    statut: 'risque',
    etiquette: 'Risque de drépanocytose de forme SC.',
    clinique:
      "L'enfant reçoit un allèle S et un allèle C. Il développera la drépanocytose de forme SC. Cette forme est généralement plus modérée que la forme SS, mais elle n'est pas bénigne : les crises vaso-occlusives existent, et des complications oculaires ou osseuses doivent être surveillées. Un suivi médical régulier, au moins une fois par an, et une vigilance particulière lors des épisodes de fatigue ou de déshydratation sont indispensables.",
    transmission:
      "À l'âge adulte, l'enfant transmettra l'allèle S ou l'allèle C à sa propre descendance, à chaque grossesse."
  },

  CC: {
    alleles: ['C', 'C'],
    statut: 'risque',
    etiquette: 'Maladie hémoglobine C homozygote.',
    clinique:
      "L'enfant reçoit un allèle C de chaque parent. Il développera la maladie hémoglobine C homozygote. Cette hémoglobinose est classée parmi les formes les mieux tolérées : une anémie hémolytique légère à modérée, parfois un ictère et un risque de calculs biliaires. La plupart des patients mènent une vie normale avec un suivi médical simple, une prise de sang annuelle et une attention portée à la fatigue inhabituelle.",
    transmission:
      "À l'âge adulte, l'enfant transmettra systématiquement l'allèle C à sa propre descendance."
  }
};

const COULEURS = {
  A: 'hsl(140, 45%, 60%)',
  S: 'hsl(14, 78%, 55%)',
  C: 'hsl(45, 85%, 60%)'
};

const CLASSE_STATUT = { sain: 'sain', porteur: 'porteur', risque: 'risque' };





/**
 * selection des parents
 */

const boutonsGeno = document.querySelectorAll('.genotype');
const alelesP1 = document.querySelectorAll('#aleles-p1 .alele');
const alelesP2 = document.querySelectorAll('#aleles-p2 .alele');
const resultats = document.getElementById('resultats');
const jauges = document.getElementById('jauges');
const explication = document.getElementById('explication');
const boutonReinit = document.getElementById('reinit');

const selection = { 1: null, 2: null };

function majAleles(parent) {
  const spans = parent === 1 ? alelesP1 : alelesP2;
  const genotype = selection[parent];
  const al = genotype ? GENOTYPES[genotype].alleles : [null, null];

  spans.forEach((span, i) => {
    if (al[i]) {
      span.textContent = al[i];
      span.style.color = al[i] === 'S' ? '#fff' : '#005254';
      span.style.borderColor = COULEURS[al[i]];
      span.style.background = COULEURS[al[i]];
      span.classList.add('present');
    } else {
      span.classList.remove('present');
      span.textContent = '';
    }
  });
}

function genotypeDepuisAlleles(a, b) {
  const paire = [a, b].sort((x, y) => ORDRE_ALLELES.indexOf(x) - ORDRE_ALLELES.indexOf(y));
  return paire.join('');
}

function calculerDistribution(g1, g2) {
  const al1 = GENOTYPES[g1].alleles;
  const al2 = GENOTYPES[g2].alleles;
  const compteur = {};

  al1.forEach((a) => {
    al2.forEach((b) => {
      const geno = genotypeDepuisAlleles(a, b);
      compteur[geno] = (compteur[geno] || 0) + 1;
    });
  });

  return compteur;
}

/**
 * rendu des jauges
 */

function renderJauges(distribution) {
  jauges.innerHTML = '';

  let retard = 0;

  Object.entries(distribution).forEach(([geno, nb]) => {
    const pct = Math.round((nb / 4) * 100);
    const info = GENOTYPES[geno];
    const carte = document.createElement('div');

    carte.className = `jauge ${CLASSE_STATUT[info.statut]}`;
    carte.style.animationDelay = `${retard}s`;

    carte.innerHTML =
      `<div class="haut">
         <span class="ge">${geno}</span>
         <span class="pourcent">${pct}%</span>
       </div>
       <div class="piste"><span class="remplissage"></span></div>
       <p class="statut">${info.etiquette}</p>`;

    jauges.appendChild(carte);
    retard += 0.12;
  });

  /* anime les remplissages apres insertion */

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      jauges.querySelectorAll('.jauge').forEach((carte) => {
        const pct = carte.querySelector('.pourcent').textContent;
        carte.querySelector('.remplissage').style.width = pct;
      });
    });
  });
}

/**
 * rendu de l'explication medicale complete
 */

function iconeCoche() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>';
}

function renderExplication(g1, g2, distribution) {
  const genos = Object.keys(distribution);
  const statuts = [...new Set(genos.map((g) => GENOTYPES[g].statut))];

  const phases = {
    sain:
      "Certaines combinaisons donnent un enfant sans aucune anomalie de l'hémoglobine.",
    porteur:
      "Certaines combinaisons donnent un porteur sain, en bonne santé, qui devra simplement le connaître avant de fonder sa propre famille.",
    risque:
      "Certaines combinaisons exposent l'enfant à une hémoglobinose qui demandera un suivi médical régulier dès les premiers mois."
  };

  const intro =
    "Chaque enfant reçoit un allèle du Parent 1 et un allèle du Parent 2. À chaque grossesse, " +
    "les quatre combinaisons possibles sont équiprobables. Voici ce que cela signifie concrètement pour vos enfants.";

  const blocsGenos = genos.map((g) => {
    const pct = Math.round((distribution[g] / 4) * 100);
    const info = GENOTYPES[g];
    return (
      `<p><strong>Génotype ${g}, probabilité de ${pct}% par grossesse.</strong> ${info.clinique} ${info.transmission}</p>`
    );
  }).join('');

  const blocsStatuts = statuts
    .map((s) => `<li>${iconeCoche()}<span>${phases[s]}</span></li>`)
    .join('');

  explication.innerHTML =
    `<h4>Ce que ce croisement signifie pour votre famille</h4>
     <p class="resume-couple">Parent 1 de type ${g1} croisé avec Parent 2 de type ${g2}.</p>
     <p>${intro}</p>
     ${blocsGenos}
     <ul>${blocsStatuts}</ul>
     <p style="margin-top:12px;">
       Notre laboratoire réalise l'électrophorèse de l'hémoglobine sur une simple prise de sang,
       et nos médecins expliquent les résultats en consultation, en toute confidentialité.
     </p>`;
}

/**
 * declenchement du calcul
 */

function simuler() {
  if (!selection[1] || !selection[2]) return;

  const distribution = calculerDistribution(selection[1], selection[2]);

  renderJauges(distribution);
  renderExplication(selection[1], selection[2], distribution);

  resultats.classList.add('affiches');

  /* replace la vue sur les resultats */

  setTimeout(() => {
    resultats.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 150);
}

boutonsGeno.forEach((bouton) => {
  bouton.addEventListener('click', () => {
    const parent = bouton.closest('.genotypes').dataset.parent;
    const groupe = bouton.closest('.genotypes');

    groupe.querySelectorAll('.genotype').forEach((b) => b.classList.remove('actif'));
    bouton.classList.add('actif');

    selection[parent] = bouton.dataset.geno;
    majAleles(Number(parent));

    if (selection[1] && selection[2]) simuler();
  });
});

boutonReinit?.addEventListener('click', () => {
  selection[1] = null;
  selection[2] = null;

  boutonsGeno.forEach((b) => b.classList.remove('actif'));
  majAleles(1);
  majAleles(2);

  resultats.classList.remove('affiches');
});

/**
 * apparition au scroll
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

