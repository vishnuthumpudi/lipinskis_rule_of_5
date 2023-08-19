const fileInput = document.getElementById('fileInput');
const lengthElement = document.getElementById('length');
const atomWeightElement = document.getElementById('atomWeight');
const hetatmWeightElement = document.getElementById('hetatmWeight');
const hbAcceptorsElement = document.getElementById('hbAcceptors');
const hbDonorsElement = document.getElementById('hbDonors');
const phRangeInput = document.getElementById('phRange');
const calculateButton = document.getElementById('calculateButton');
const logPElement = document.getElementById('logP');

const atomicWeights = {
  'H': 1.0079,
  'C': 12.0107,
  'N': 14.0067,
  'O': 15.9994
  // ... Add more elements and their weights
};

const hbAcceptorAtoms = new Set(['O', 'N']); // Hydrogen bond acceptor atoms
const hbDonorAtoms = new Set(['H', 'N']);    // Hydrogen bond donor atoms

function extractEntriesFromPDB(pdbContent, entryType) {
  const lines = pdbContent.split('\n');
  const entries = [];

  for (const line of lines) {
    if (line.startsWith(entryType)) {
      entries.push(line);
    }
  }

  return entries;
}

function calculateMolecularWeight(entries) {
  let molecularWeight = 0;

  for (const entry of entries) {
    const atomElement = entry.slice(12, 14).trim();
    if (atomicWeights[atomElement]) {
      molecularWeight += atomicWeights[atomElement];
    }
  }

  return molecularWeight;
}

function countHydrogenBondAcceptors(entries, ph) {
  let count = 0;

  for (const entry of entries) {
    const atomElement = entry.slice(12, 14).trim();
    if (hbAcceptorAtoms.has(atomElement) && isAcceptorAtGivenpH(atomElement, ph)) {
      count++;
    }
  }

  return count;
}

function countHydrogenBondDonors(entries, ph) {
  let count = 0;

  for (const entry of entries) {
    const atomElement = entry.slice(12, 14).trim();
    if (hbDonorAtoms.has(atomElement) && isDonorAtGivenpH(atomElement, ph)) {
      count++;
    }
  }

  return count;
}

function isAcceptorAtGivenpH(atom, ph) {
  // Define ionization states of atoms based on pH (pKa values)
  const ionizationStates = {
    'O': ph > 2,  // Ionized above pH 2 (carboxylate)
    'N': ph > 9   // Ionized above pH 9 (ammonium)
  };
  return ionizationStates[atom];
}

function isDonorAtGivenpH(atom, ph) {
  // Define ionization states of atoms based on pH (pKa values)
  const ionizationStates = {
    'H': ph < 7,  // Ionized below pH 7 (protonated)
    'N': ph < 7   // Ionized below pH 7 (protonated)
  };
  return ionizationStates[atom];
}

function calculateLogP(hbAcceptors, hbDonors) {
  // A simplified formula for calculating Log P
  // Note: This is a very simplified example, actual Log P calculations are more complex
  return hbDonors - hbAcceptors;
}

calculateButton.addEventListener('click', function() {
  const phValue = parseFloat(phRangeInput.value);
  if (!isNaN(phValue)) {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const pdbContent = e.target.result;
        const atomEntries = extractEntriesFromPDB(pdbContent, 'ATOM');
        const hetatmEntries = extractEntriesFromPDB(pdbContent, 'HETATM');
        const atomWeight = calculateMolecularWeight(atomEntries);
        const hetatmWeight = calculateMolecularWeight(hetatmEntries);
        const hbAcceptors = countHydrogenBondAcceptors(atomEntries.concat(hetatmEntries), phValue);
        const hbDonors = countHydrogenBondDonors(atomEntries.concat(hetatmEntries), phValue);

        const totalMass = atomWeight + hetatmWeight;
        atomWeightElement.textContent = atomWeight.toFixed(4) + ' Da';
        hetatmWeightElement.textContent = hetatmWeight.toFixed(4) + ' Da';
        hbAcceptorsElement.textContent = hbAcceptors;
        hbDonorsElement.textContent = hbDonors;

        // Calculate Log P
        const logP = calculateLogP(hbAcceptors, hbDonors);
        logPElement.textContent = logP.toFixed(2);
      };
      reader.readAsText(file);
    }
  }
});
