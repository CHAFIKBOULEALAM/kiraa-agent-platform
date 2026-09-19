
const testScenario = async (text) => {
  const formData = new FormData();
  formData.append('message', text);
  formData.append('threadId', 'test-' + Math.random().toString(36).substring(7));
  const res = await fetch('http://127.0.0.1:3001/api/chat', { method: 'POST', body: formData });
  return await res.json();
};

const run = async () => {
  const scenarios = [
    'Je cherche une petite citadine, genre une Fiat, pour le weekend du 10 au 12 octobre',
    'J ai 19 ans et je veux savoir si je peux louer une voiture',
    'Bonjour, avez-vous des Porsche disponibles ? J ai 23 ans.'
  ];
  for (let i = 0; i < scenarios.length; i++) {
    console.log('\n--- Test ' + (i + 1) + ' ---');
    console.log('Input:', scenarios[i]);
    const res = await testScenario(scenarios[i]);
    console.dir(res, { depth: null });
  }
};
run();

