import fs from 'fs';

const API_URL = 'https://kiraa-agent-platform-production.up.railway.app/api/chat';

const allScenarios = [
  {
    name: '1. Dassi vehicle',
    payload: {
      messages: [{ role: 'user', content: 'je voudrai une voiture dassi' }]
    }
  },
  {
    name: '2. Minor driver (19)',
    payload: {
      messages: [{ role: 'user', content: "Je veux louer une clio du 10 au 15 octobre, j'ai 19 ans et j'ai mon permis depuis le 01/01/2025" }]
    }
  },
  {
    name: '3. Expired licence',
    payload: {
      messages: [{ role: 'user', content: "Je veux louer une clio du 10 au 15 octobre, j'ai 35 ans et mon permis, obtenu le 01/01/2010, est expiré." }]
    }
  },
  {
    name: '4. 22-year-old requesting Premium',
    payload: {
      messages: [{ role: 'user', content: "Je veux louer une Range Rover du 10 au 15 octobre, j'ai 22 ans et j'ai mon permis depuis le 01/01/2022" }]
    }
  },
  {
    name: '5. Discount code above 15%',
    payload: {
      messages: [{ role: 'user', content: "Je veux louer une clio du 10 au 15 octobre, j'ai 30 ans, permis depuis 2015, avec le code SUMMER20" }]
    }
  },
  {
    name: '6. Pure policy question',
    payload: {
      messages: [{ role: 'user', content: "C'est quoi votre politique d'annulation ?" }]
    }
  },
  {
    name: '7. Genuinely off-topic',
    payload: {
      messages: [{ role: 'user', content: "Quel est le temps qu'il fait aujourd'hui ?" }]
    }
  },
  {
    name: '8. Vehicle mention only (missing slots)',
    payload: {
      messages: [{ role: 'user', content: 'je veux louer une Audi A7' }]
    }
  },
  {
    name: '9. Follow-up providing dates',
    payload: {
      threadId: 'scenario-8-thread',
      messages: [{ role: 'user', content: "du 15 au 20 octobre, j'ai 30 ans, permis depuis le 01/01/2015." }]
    }
  },
  {
    name: '10. PDF generation (Rejected)',
    payload: {
      messages: [{ role: 'user', content: "Je veux louer une Range Rover du 10 au 15 octobre, j'ai 18 ans et j'ai mon permis depuis le 01/01/2025" }]
    }
  }
];

const scenarios = [allScenarios[9]];
async function run() {
  const results: any = {};
  for (const s of scenarios) {
    console.log("Running " + s.name + "...");
    try {
      const formData = new FormData();
      // Only extract the message from payload.messages[0].content
      const message = s.payload.messages[0].content;
      formData.append("message", message);
      if (s.payload.threadId) {
        formData.append("threadId", s.payload.threadId);
      }
      
      const res = await fetch(API_URL, {
        method: 'POST',
        // No Content-Type header needed for FormData; fetch will set it correctly with the boundary
        body: formData
      });
      const data = await res.json();
      results[s.name] = data;
      if (s.name === '8. Vehicle mention only (missing slots)') {
         scenarios[8].payload.threadId = data.requestId || 'scenario-8-thread';
      }
    } catch (e: any) {
      results[s.name] = { error: e.message };
    }
    await new Promise(r => setTimeout(r, 6000));
  }
  fs.writeFileSync('scenario_results.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}

run();
