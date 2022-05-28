import './App.css';
import { useRef, useState, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const webSocketHost ="ws://79.110.234.43:11121" 
function App() {
  var secretKeyInput = useRef(null);
  var outgoingDataInput__loginName = useRef(null);
  var outgoingDataInput__loginPass = useRef(null);
  var outgoingDataInput__orderId = useRef(null);
  var outgoingDataInput__targetAccount = useRef(null);
  var outgoingDataInput__postLimit = useRef(null);
  var outgoingDataInput__serviceName = useRef(null);
  var incomingDataInput__ConsoleOUT = useRef(null);
  var incomingDataInput__ERR = useRef(null);
  const [showSecretInput, setShowSecretInput] = useState(localStorage.getItem("secret") === null);
  var ws = new WebSocket(webSocketHost);
  // function sleep(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // };
  const reconnect = async (event) => {
    var tmpWs = new WebSocket(webSocketHost);
    while (!tmpWs.CONNECTING && !tmpWs.OPEN) {
      tmpWs = new WebSocket(webSocketHost);
      await new Promise(r => setTimeout(r, 1500));
    };
    tmpWs.onerror = ws.onerror;
    tmpWs.onopen = ws.onopen;
    tmpWs.onmessage = ws.onmessage;
    ws = tmpWs;
  };
  ws.onopen = (event) => {
    console.log(`Connected to ${webSocketHost}`);
  };
  ws.onclose = async(event) => {
    console.log("Connection to WebSocket Server has closed!");
    await new Promise(r => setTimeout(r, 1500));
    reconnect();
  };
  const sendMessage = async() => {
    var array = [outgoingDataInput__loginName, outgoingDataInput__loginPass, outgoingDataInput__orderId, outgoingDataInput__postLimit, outgoingDataInput__serviceName, outgoingDataInput__targetAccount];
    for (let index = 0; index < array.length; index++) {
      let element = array[index];
      if (element.current.value === ""){
        toast.error("Lütfen tüm bilgileri giriniz!")
        return;
      }
    }
    if (ws.CLOSED || ws.CLOSING){
      reconnect();
      await new Promise(r => setTimeout(r, 1500));
    };
    var data = {
      "secret": localStorage.getItem("secret"),
      "loginName": outgoingDataInput__loginName.current.value,
      "loginPass": outgoingDataInput__loginPass.current.value,
      "orderId": outgoingDataInput__orderId.current.value,
      "targetAccount": outgoingDataInput__targetAccount.current.value,
      "postLimit": outgoingDataInput__postLimit.current.value,
      "serviceName": outgoingDataInput__serviceName.current.value
    }
    ws.send(JSON.stringify(data));
    console.log("Succesfully sent message: " + JSON.stringify(data)); 
  };
  ws.onmessage = (event) => {
    var data = JSON.parse(event.data);
    console.log("Message got: " + JSON.stringify(data));
    if (data["error"] !== ""){
      toast.error(data["error"]);
    };
    if (data["invalidSecret"] === true) {
      localStorage.removeItem("secret");
      setShowSecretInput(true);
    };
    console.log(data);
    if (data["success"] !== true) {
      return;
    }
    toast.success("Başarıyla veri toplandı ve \"Gelen Metin\"e yazdırıldı!");
    incomingDataInput__ConsoleOUT.current.value = data["data"];
  };
  return (
    <div className="App">
      <div className="frame">
        {
          (showSecretInput) ? (
            <div>
              <h3>GİZLİ ANAHTARI GİRİNİZ</h3>
              <input ref={secretKeyInput}/>
              <input type="submit" onClick={() => {
                if (secretKeyInput.current.value === "") {
                  toast.error("Gizli anahtar boş bırakılmamalı!");
                  return;
                };
                localStorage.setItem("secret", secretKeyInput.current.value);
                setShowSecretInput(false);
              }}/>
            </div>
          ) : (
            <div>
              <h3>INSTAGRAM CLIENT</h3>
              <br/>
              <div className="form">
                <h5>GİRİŞ YAPILACAK HESABIN;</h5>
                <a>Kullanıcı Adı : </a><input id="" ref={outgoingDataInput__loginName}/>
                <a>Şifresi :</a><input id="" ref={outgoingDataInput__loginPass}/>
                <br/><br/>
                <a>Sipariş Numarası :</a><input id="" ref={outgoingDataInput__orderId}/>
                <br/><a>Hedef Instagram Kullanıcı Adı :</a><input id="" ref={outgoingDataInput__targetAccount}/>
                <br/><a>Gönderi Limiti :</a><input id="" ref={outgoingDataInput__postLimit}/>
                <br/><a>Hizmet Adı veya Servis Numarası :</a><input id="" ref={outgoingDataInput__serviceName}/>
                <br/><input type="submit" onClick={sendMessage}/>
              </div>
              <br/>
              <h3>Gelen Metin</h3>
              <div className="incoming">
                <textarea readOnly={true} ref={incomingDataInput__ConsoleOUT} type="text" />
              </div>
              <br/>
            </div>
          )
        }
        <ToastContainer/>
      </div>
    </div>
  );
}

export default App;
