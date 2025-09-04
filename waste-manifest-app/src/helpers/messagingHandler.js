
export default function messagingHandler(message) {

        useEffect(() => {
            // // recieving data from parent window using localstorage
            // const finchoice_onboarding = localStorage.getItem('finchoice_onboarding');
            // console.log('got finchoice_onboarding from localstorage',finchoice_onboarding);
        
            // Function to send message to parent window
            const sendMessageToParent = () => {
              const message = { type: 'FC Pay', data: message };
              window.parent.postMessage(message, '*');
            };        
            // Send message to parent window
            sendMessageToParent();
        
            // Event listener to receive messages from parent window
            const handleMessageFromParent = (event) => {
              // Check if the message is from the expected source
              if (event.origin !== 'http://localhost') {
                return;
              }

              // Access message data sent from parent
              const { type, data } = event.data;

              // Handle message based on type
              if (type === 'hello') {
                console.log('Received message from Vue:', data);
              }
            };
        
            // Add event listener to window
            window.addEventListener('message', handleMessageFromParent);
        
            // Clean up event listener on component unmount
            return () => {
              window.removeEventListener('message', handleMessageFromParent);
            };
        }, []);
}