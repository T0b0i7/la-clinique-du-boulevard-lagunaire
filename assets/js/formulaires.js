/**
 * formulaires.js
 * Gestion des formulaires du site : prise de rendez-vous et contact.
 *
 * Le site est statique. Pour recevoir les demandes par email, creer un
 * formulaire gratuit sur https://formspree.io puis coller son adresse
 * dans FORMSPREE_ENDPOINT, par exemple :
 *   const FORMSPREE_ENDPOINT = "https://formspree.io/f/XXXXXXXX";
 * Tant que la constante est vide, les demandes restent locales :
 * le visiteur recoit une reference et est invite a appeler la clinique.
 */

const FORMSPREE_ENDPOINT = "";

const NUMERO_CLINIQUE = "+229 01 94 46 52 52";



/**
 * Genere une reference lisible du type CBL-RDV-260101-K4TX.
 */
function genererReference(prefixe) {
  const aujourdhui = new Date();
  const jj = String(aujourdhui.getDate()).padStart(2, "0");
  const mm = String(aujourdhui.getMonth() + 1).padStart(2, "0");
  const aa = String(aujourdhui.getFullYear()).slice(2, 4);
  const hasard = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CBL-${prefixe}-${aa}${mm}${jj}-${hasard}`;
}



/**
 * Affiche le premier message d'erreur non valide d'un formulaire.
 * Renvoie true si le formulaire est valide.
 */
function validerFormulaire(formulaire) {
  let premierChampInvalide = null;

  formulaire.querySelectorAll(".champ").forEach((champ) => {
    const champSaisie = champ.querySelector("input, select, textarea");
    const message = champ.querySelector(".message-erreur");
    const erreur = trouverErreur(champSaisie);

    champSaisie.classList.toggle("erreur", Boolean(erreur));
    if (message && erreur) {
      // pour un champ requis, garder le message specifique deja ecrit dans la page
      if (!message.dataset.texte) {
        message.dataset.texte = erreur === "requis" ? message.textContent : erreur;
      }
      message.textContent = message.dataset.texte;
      message.hidden = false;
    } else if (message) {
      message.hidden = true;
    }

    if (erreur && !premierChampInvalide) {
      premierChampInvalide = champSaisie;
    }
  });

  if (premierChampInvalide) {
    premierChampInvalide.focus();
    return false;
  }

  return true;
}



/**
 * Renvoie le texte d'erreur d'un champ, ou une chaine vide si le champ est valide.
 */
function trouverErreur(champSaisie) {
  const valeur = champSaisie.value.trim();

  if (champSaisie.required && !valeur) {
    return "requis";
  }

  if (champSaisie.type === "email" && valeur && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur)) {
    return "Veuillez indiquer une adresse email valide.";
  }

  if (champSaisie.type === "tel" && valeur) {
    const chiffres = valeur.replace(/[^0-9]/g, "");
    if (chiffres.length < 8 || chiffres.length > 14) {
      return "Veuillez indiquer un numéro de téléphone valide.";
    }
  }

  if (champSaisie.type === "date" && valeur) {
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    if (new Date(`${valeur}T00:00:00`) < aujourdhui) {
      return "Veuillez choisir une date à partir d'aujourd'hui.";
    }
  }

  return "";
}



/**
 * Tente d'envoyer les donnees vers Formspree si l'adresse est configuree.
 * Renvoie true si l'envoi a reussi ou si aucune adresse n'est configuree.
 */
async function envoyerVersService(donnees) {
  if (!FORMSPREE_ENDPOINT) {
    return true;
  }

  try {
    const reponse = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(donnees),
    });
    return reponse.ok;
  } catch {
    return false;
  }
}



/**
 * Libelle lisible d'une specialite.
 */
const LIBELLES_SPECIALITE = {
  "medecine-generale": "Médecine générale",
  "urgences": "Urgences (24h/24)",
  "rhumatologie": "Rhumatologie",
  "chirurgie": "Chirurgie",
  "orthopedie": "Orthopédie",
  "laboratoire": "Laboratoire d'analyses biomédicales",
  "electrophorese": "Électrophorèse de l'hémoglobine",
  "autre": "Autre motif",
};

const LIBELLES_CRENEAU = {
  "matin": "Matin (08h à 12h)",
  "apres-midi": "Après-midi (14h à 18h)",
  "soir": "Soir (18h à 21h)",
  "nuit": "Nuit (21h à 08h, urgence)",
};

const LIBELLES_MEDECIN = {
  "sans-preference": "Sans préférence",
  "dr-setondji": "Dr Sètondji Ahounou (exemple)",
  "dr-nadia": "Dr Nadia Kpossou (exemple)",
  "dr-marius": "Dr Marius Dossou (exemple)",
  "dr-firmin": "Dr Firmin Adanhoumè (exemple)",
};

/**
 * Formate une date ISO (aaaa-mm-jj) en jour lisible, ex. : samedi 3 janvier 2026.
 */
function formaterDate(iso) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}



/**
 * Gere la soumission du formulaire de rendez-vous.
 */
function gererRendezVous(formulaire) {
  const confirmation = document.getElementById("confirmation-rdv");
  const reference = document.getElementById("reference-rdv");
  const recap = document.getElementById("recap-rdv");

  // date minimale : aujourd'hui
  const champDate = document.getElementById("rdv-date");
  if (champDate) {
    champDate.min = new Date().toISOString().slice(0, 10);
  }

  // preselection depuis l'URL, ex. : rendez-vous.html?specialite=rhumatologie&medecin=dr-nadia
  const parametres = new URLSearchParams(window.location.search);
  const specialite = parametres.get("specialite");
  const medecin = parametres.get("medecin");
  if (specialite && formulaire.specialite.querySelector(`option[value="${specialite}"]`)) {
    formulaire.specialite.value = specialite;
  }
  if (medecin && formulaire.medecin.querySelector(`option[value="${medecin}"]`)) {
    formulaire.medecin.value = medecin;
  }

  formulaire.addEventListener("submit", async (evenement) => {
    evenement.preventDefault();

    if (!validerFormulaire(formulaire)) {
      return;
    }

    const bouton = formulaire.querySelector(".bouton-envoyer");
    bouton.disabled = true;

    const donnees = {
      type: "demande de rendez-vous",
      nom: formulaire.nom.value.trim(),
      telephone: formulaire.telephone.value.trim(),
      email: formulaire.email.value.trim() || "(non renseigné)",
      specialite: LIBELLES_SPECIALITE[formulaire.specialite.value] || formulaire.specialite.value,
      medecin: LIBELLES_MEDECIN[formulaire.medecin.value] || formulaire.medecin.value,
      date: formaterDate(formulaire.date.value),
      creneau: LIBELLES_CRENEAU[formulaire.creneau.value] || formulaire.creneau.value,
      motif: formulaire.motif.value.trim() || "(non renseigné)",
    };

    const envoye = await envoyerVersService({
      _subject: `Demande de rendez-vous, ${donnees.nom}`,
      ...donnees,
    });

    const numeroReference = genererReference("RDV");

    recap.innerHTML = [
      ["Nom", donnees.nom],
      ["Téléphone", donnees.telephone],
      ["Email", donnees.email],
      ["Service", donnees.specialite],
      ["Médecin", donnees.medecin],
      ["Date", donnees.date],
      ["Créneau", donnees.creneau],
      ["Motif", donnees.motif],
    ].map(([terme, valeur]) => `<dt>${terme}</dt><dd>${echapper(valeur)}</dd>`).join("");

    reference.textContent = numeroReference;

    const noteAuto = confirmation.querySelector(".confirmation-note");
    if (!envoye) {
      noteAuto.insertAdjacentHTML("beforebegin",
        `<p class="message-erreur">L'envoi automatique a échoué. Merci d'appeler la clinique pour confirmer.</p>`);
    }

    formulaire.hidden = true;
    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: "smooth", block: "center" });

    bouton.disabled = false;
  });
}



/**
 * Gere la soumission du formulaire de contact simple.
 */
function gererContact(formulaire) {
  const confirmation = document.getElementById("confirmation-contact");
  const reference = document.getElementById("reference-contact");
  const recap = document.getElementById("recap-contact");

  formulaire.addEventListener("submit", async (evenement) => {
    evenement.preventDefault();

    if (!validerFormulaire(formulaire)) {
      return;
    }

    const bouton = formulaire.querySelector(".bouton-envoyer");
    bouton.disabled = true;

    const donnees = {
      type: "message de contact",
      nom: formulaire.nom.value.trim(),
      email: formulaire.email.value.trim(),
      message: formulaire.message.value.trim(),
    };

    const envoye = await envoyerVersService({
      _subject: `Message de contact, ${donnees.nom}`,
      ...donnees,
    });

    reference.textContent = genererReference("MSG");

    recap.innerHTML = [
      ["Nom", donnees.nom],
      ["Email", donnees.email],
      ["Message", donnees.message],
    ].map(([terme, valeur]) => `<dt>${terme}</dt><dd>${echapper(valeur)}</dd>`).join("");

    if (!envoye) {
      confirmation.insertAdjacentHTML("beforeend",
        `<p class="message-erreur">L'envoi automatique a échoué. Merci d'appeler la clinique au ${NUMERO_CLINIQUE}.</p>`);
    }

    formulaire.hidden = true;
    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: "smooth", block: "center" });

    bouton.disabled = false;
  });
}



/**
 * Protege le texte insere dans le recapitulatif.
 */
function echapper(texte) {
  const conteneur = document.createElement("div");
  conteneur.textContent = texte;
  return conteneur.innerHTML;
}



document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('form[data-form-type="rendez-vous"]').forEach(gererRendezVous);
  document.querySelectorAll('form[data-form-type="contact"]').forEach(gererContact);

  // apparition douce des blocs, comme sur les autres pages du site
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
});
