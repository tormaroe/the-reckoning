async function loadSession(sessionId) {
    const response = await fetch(`/session/${sessionId}`);
    const data = await response.json();
    console.log(data);
    return data;
}

// TODO: error handling

window.onload = async () => {
    const sessionId = window.location.hash.substring(1);
    document.getElementById('sub-header').innerText = 'Session ID: ' + sessionId;
    const countersContainer = document.getElementById('counters');
    let session = await loadSession(sessionId);
    redrawCounters();

    const webSocket = new WebSocket(`wss://${window.location.host}/`);
    webSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.id === sessionId) {
            session = data;
            redrawCounters();
        }
    };

    function makeCounterButton(text, cssClass, url) {
        const incrementButton = document.createElement('button');
        incrementButton.className = cssClass;
        incrementButton.innerText = text;
        incrementButton.addEventListener('click', async () => {
            const response = await fetch(url, {
                method: 'POST',
            });
            session = await response.json();
            //redrawCounters();
        });
        return incrementButton;
    }

    function makeCounterElement(counter) {
        const counterElement = document.createElement('div');
        counterElement.className = 'counter';

        const counterLabelElement = document.createElement('div');
        counterLabelElement.className = 'counter-label';
        counterLabelElement.innerText = `${counter.name}: ${counter.value}`;
        counterElement.appendChild(counterLabelElement);

        counterElement.appendChild(makeCounterButton('+', 'increment', `/api/increment-counter/${sessionId}/${session.counters.indexOf(counter)}`));
        counterElement.appendChild(makeCounterButton('-', 'decrement', `/api/decrement-counter/${sessionId}/${session.counters.indexOf(counter)}`));

        return counterElement;
    }

    function redrawCounters() {
        countersContainer.innerHTML = '';
        session.counters.forEach(counter => {
            countersContainer.appendChild(makeCounterElement(counter));
        });
    }

    document.getElementById('add-counter').addEventListener('click', async () => {
        console.log('add-counter');
        const name = prompt('Enter counter name:');
        
        if (!name)
            return;
        
        const response = await fetch(`/api/add-counter/${sessionId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name }),
        });
        session = await response.json();
        console.log(session);
        
        //redrawCounters();
    });
};
