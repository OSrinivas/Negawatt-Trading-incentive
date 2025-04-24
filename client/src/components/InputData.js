import React, { useState } from 'react'


function InputData({contract}) {
  // const [countParticipant,setCountParticipant]=useState(1);
  const [results, setResults] = useState([]);
  const [success,setSuccess] =useState(false);
  // const [isInitilised,setIsInitialised]=useState(false);
  const [haveResult,setHaveResult]=useState(false);
  const [consumerId,setConsumerId]=useState('');
  const [showAlert,setShowAlert]=useState(false);
  const [AlertData,setAlertData]=useState('');
  const[totalCommitment,setTotalCommitment]=useState('');
 
  const [requiredToken,setRequiredToken]=useState('');
  const [eventId,setEventId]=useState('');

  function handleRequiredTokenChange(e){
    setRequiredToken(e.target.value);
  }
  const [id,setId]=useState(''); 
  const [commitment,setCommitment]=useState('');
  const [actual,setActual]=useState('');

  
  function handleIdChange(e){
    setId(e.target.value);
  }
  function handleCommitmentChange(e){
    setCommitment(e.target.value);
  }
  function handleActualChange(e){
    setActual(e.target.value);
  }
  function handleEventIdChange(e){
    setEventId(e.target.value);
  }
  function handleConsumerIdChange(e){
    setConsumerId(e.target.value);
  }
  async function RegisterConsumer(){
    try {
      // console.log("consumer id : ",consumerId," req Token :",requiredToken);
      const _consumerId=consumerId;
      const _requiredToken=requiredToken;
      const[success,message]=await contract.callStatic.registerConsumer(_consumerId,_requiredToken);
      if(!success){
        alert(message);
        return;
      }
      const tx=await contract.registerConsumer(consumerId,requiredToken);
      await tx.wait();
      alert(message);
      if(tx.hash){
        console.log(`Consumer registered with consumer ID : ${consumerId}`);
      }
      setConsumerId('');
      setRequiredToken('');
    } catch (error) {
      console.log("error while register consumer ",error);
    }
  }
  async function RegisterParticipant() {
    try {
      // Convert values to appropriate types
      const participantId = id;
      const commitmentValue = commitment;
      const actualNegawatt = actual;
  
      // Call the contract function
      // console.log("participantId :",participantId, "   commitment : ",commitmentValue,"  actual: ",actualNegawatt);
      const [success,message] = await contract.callStatic.registerParticipant(participantId, commitmentValue, actualNegawatt);
      if(!success){
        alert(message);
        return;
      }
      const tx = await contract.registerParticipant(participantId, commitmentValue, actualNegawatt);
      await tx.wait(); // optional: wait for transaction to be mined
      alert(message);
      if(tx.hash){
        console.log(`Participant : ${participantId} registered successfully`);
      }
      setId('');
      setCommitment('');
      setActual('');
      // console.log(tx);
    } catch (error) {
      alert("Registration failed:", error);
    }
  }
  async function resetEvent(){
    try {
      const [succes,message]=await contract.callStatic.reset();
      if(!succes){
        alert(message);
        return;
      }
      const tx=await contract.reset();
      await tx.wait();
      alert(message);
      setEventId('');
      setRequiredToken('');
      console.log("Event Reset with tx hash: ",tx.hash);
      setHaveResult(false);
      
      
    } catch (error) {
      console.log("error in EventReset ",error);
    }
    
  }

  async function finaliseResult(){
    try {
      const [success,message]=await contract.callStatic.finalizeResults();
      if(!success){
        alert(message);
        return;
      }
      const tx=await contract.finalizeResults();
      await tx.wait();
      alert(message);
      // console.log("tx: ",tx,"   \n","res: ",res);
      console.log("function finalised with tx hash ",tx.hash);
    } catch (error) {
      console.log("error in finalising function",error);
    }
  }
  async function getResult(){
    try {
      // const tx=await contract.finalizeResults();
      // await tx.wait();
      const [isCommitZero,rtokens,data, contractSuccess,eventId,_totalCommit]=await contract.getResults();
      // console.log("Array Data:", data);          // 2D array
      // console.log("Contract Success:", contractSuccess); // boolean
      
      setEventId(Number(eventId));
      setRequiredToken(Number(rtokens));
      setSuccess(contractSuccess);
      console.log(`contractsuccess :${contractSuccess} eventId:${eventId} rtokens:${rtokens}  {_totalCommit}`);
      setTotalCommitment(Number(_totalCommit));
      // console.log("data :",data);
      const formatted = data.map(row => ({
        participantId: Number(row[0]),
        commitment:Number(row[1]),
        contribution:Number(row[2]),
        amountMissed: Number(row[3]),
        incentive: Number(row[4]),
        penalty: Number(row[5]),
        balance: Number(row[6]),
      }));
      // console.log("after data map ",formatted);
      if(isCommitZero){
        setAlertData("No participant has done any contribution.No penalty/incentive");
        setShowAlert(true);
      }else{
        if(contractSuccess){
          setAlertData(`low volatage Event ${eventId} Achieved`);
          setShowAlert(true);
        }else{
          setAlertData(`low volatage Event ${eventId} not met`);
          setShowAlert(true);
        }
      }
      
      setResults(formatted);
      // console.log("Set Results:", results);
      
      
      setHaveResult(true);
      console.log("result fetched with successfully")
    } catch (error) {
      console.log("error in finalize ",error);
    }
  }
  async function initialiseToken(){
    try {

      const [success, message] = await contract.callStatic.initialize(eventId);
      // console.log("Call Static - Success:", success, "Message:", message);
      if(!success){
        alert(message);
        return;
      }
      
      // Now, send the actual transaction to change the state
      const tx = await contract.initialize(eventId);
      await tx.wait(); // Wait for the transaction to be confirmed
      alert(message);
      console.log("Event Initialise with tx hash:", tx.hash);
      setEventId('');
      

    } catch (error) {
      console.log(error,"Error in initialisation");
    }
  }
  

return (
    <>
      {showAlert && (success ? (
  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded shadow-lg z-50">
    <div className="flex items-center justify-between space-x-4">
      <span>
        <strong className="font-bold text-2xl  text-center">{AlertData}</strong> 
      </span>
      <button onClick={() => setShowAlert(false)} className="text-green-700 text-lg font-bold">
        &times;
      </button>
    </div>
  </div>
) :(
  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow-lg z-50">
    <div className="flex items-center justify-between space-x-4">
      <span>
        <strong className="font-bold text-2xl  text-center">{AlertData}</strong> 
      </span>
      <button onClick={() => setShowAlert(false)} className="text-red-700 text-lg font-bold">
        &times;
      </button>
    </div>
  </div>
))}


    {/* <div className="p-6 bg-white rounded-xl shadow-md max-w-6xl mx-auto space-y-6"></div> */}
      <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800 underline">Negawatt Energy Trading</h2>

      {/* Top Form Sections */}
      <div className="flex flex-col sm:flex-row gap-6">
      
        {/* Event Registration */}
        <div className="w-full space-y-4">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Utility-Deployer</h2>
          <label htmlFor="EventId" className="block font-medium text-gray-900">
            Event ID
          </label>
          <input
            type="number"
            name="EventID"
            id="EventID"
            placeholder="Event ID"
            value={eventId}
            onChange={handleEventIdChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={initialiseToken}
            className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Register Event
          </button>
          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-4 pt-2">
            
            <button
              onClick={finaliseResult}
              className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Finalize Result
            </button>
            <button
              onClick={getResult}
              className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Get Result
            </button>
            <button
              onClick={resetEvent}
              className="px-4 py-2 bg-red-700 text-white rounded hover:bg-blue-800"
            >
              Reset
            </button>
          </div>

        </div>
        

        {/* Consumer Registeration */}
        <div className="w-full space-y-4">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Consumer Negawatt Demand Request</h2>
          <label htmlFor="ConsumerId" className="block font-medium text-gray-900">
            Consumer ID
          </label>
          <input
            type="number"
            name="ConsumerId"
            id="ConsumerId"
            placeholder="Consumer ID"
            value={consumerId}
            onChange={handleConsumerIdChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label htmlFor="Token" className="block font-medium text-gray-900">
            Required NegWatt
          </label>
          <input
            type="number"
            name="Token"
            id="Token"
            placeholder="Required Token"
            value={requiredToken}
            onChange={handleRequiredTokenChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={RegisterConsumer}
            className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Register Consumer
          </button>
        </div>

        {/* Participant Registration */}
        <div className="w-full space-y-4">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Incentive Consumer Registeration</h2>
          <label htmlFor="Id" className="block font-medium text-gray-700">
            Participant ID
          </label>
          <input
            type="number"
            name="Id"
            id="Id"
            placeholder="Participant Id"
            value={id}
            onChange={handleIdChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label htmlFor="Commitment" className="block font-medium text-gray-700">
            Commitment
          </label>
          <input
            type="number"
            name="Commitment"
            id="Commitment"
            placeholder="Commitment Value"
            value={commitment}
            onChange={handleCommitmentChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label htmlFor="Actual" className="block font-medium text-gray-700">
            Contribution
          </label>
          <input
            type="number"
            name="Actual"
            id="Actual"
            placeholder="Contribution"
            value={actual}
            onChange={handleActualChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={RegisterParticipant}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Register Participant
          </button>
        </div>
      </div>

      
    </div>

      {/* <div className="p-4 overflow-x-auto mt-8 bg-white rounded-xl shadow-md max-w-full mx-auto border border-gray-300"> */}
      <div className="p-1 overflow-x-auto mt-8 bg-white rounded-xl shadow-md w-full max-w-4xl mx-auto border border-gray-300">

        {haveResult && (
          <>

            <h2 className="text-xl font-bold mb-4 text-green-900 text-center">
              Negawatt Event Results (Required Negawatt: {requiredToken} kWh , Total Contribution: {totalCommitment} kWh)
            </h2>

            <div className={`text-center mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>
              <h3 className="text-lg font-semibold">
                {success ? 'Required Demand-Supply Achieved!' : 'Required Demand-Supply Not Met'}
              </h3>
            </div>

            <table className="min-w-full table-auto border border-gray-800 border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-800 px-2 py-2">ParticipantId</th>
                  <th className="border border-gray-800 px-2 py-2">Commitment (KWh)</th>
                  <th className="border border-gray-800 px-2 py-2">Contribution (KWh)</th>
                  <th className="border border-gray-800 px-2 py-2">Amount Missed</th>
                  <th className="border border-gray-800 px-2 py-2">Incentives in ₹(INR)</th>
                  <th className="border border-gray-800 px-2 py-2">Penalty in ₹(INR)</th>
                  <th className="border border-gray-800 px-2 py-2">Balance in ₹(INR)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((p, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-800 px-2 py-2">{p.participantId}</td>
                    <td className="border border-gray-800 px-2 py-2">{p.commitment}</td>
                    <td className="border border-gray-800 px-2 py-2">{p.contribution}</td>
                    <td className="border border-gray-800 px-2 py-2">{p.amountMissed}</td>
                    <td className="border border-gray-800 px-2 py-2">{p.incentive}</td>
                    <td className="border border-gray-800 px-2 py-2">{p.penalty}</td>
                    <td className="border border-gray-800 px-2 py-2">{p.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}

export default InputData;

