let log = (txt) => {
    console.log(txt);
    document.getElementById("log").innerText += txt + "\n"
}
let extract = (event) => {
  let file = event.target.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (e) => {
    let netlog = e.target.result;
    let split_netlog = netlog.split("\n");
    let policyNets = [];
    for (let i = 0; i < split_netlog.length; i++) { // Find the line where the policy was returned. These encodes are fragments of the string "NetworkConfiguration".
      if (split_netlog[i].includes("ya0NvbmZpZ3VyYXRpb2") || split_netlog[i].includes("vcmtDb25maWd1cmF0aW") || split_netlog[i].includes("rQ29uZmlndXJhdGlvbn") || split_netlog[i].includes("Db25maWd1cmF0aW9ucw")) {
        log(i);
        policyNets.push(split_netlog[i]);
      }
    }
    policyNets.forEach(policyNet => {
      try {
        policyNet = atob(policyNet.substring((policyNet.indexOf('"bytes":"') + 9), (policyNet.indexOf('"},"phase"'))));
        log(policyNet);
        let NetworkConfigurations = policyNet.substring(policyNet.indexOf('"NetworkConfigurations":'), policyNet.indexOf("]\n}b")) + "]";
        NetworkConfigurations = NetworkConfigurations.substring(0, NetworkConfigurations.search(/}\n *]/));
        NetworkConfigurations = NetworkConfigurations.replace(/("NetworkConfigurations":|\n)/g, "") + "}]";
        log(NetworkConfigurations);
        eval("NetworkConfigurations = " + NetworkConfigurations);
        for (wifi in NetworkConfigurations) {
          if (NetworkConfigurations[wifi]["Type"] != "WiFi") continue; // Skip non WiFi networks such as Ethernet
          log(NetworkConfigurations[wifi]);
          let tr = document.createElement("tr");
          let SSID = document.createElement("td");
          SSID.innerText = NetworkConfigurations[wifi]["WiFi"]["SSID"];
          let Security = document.createElement("td");
          Security.innerText = NetworkConfigurations[wifi]["WiFi"]["Security"];
          let Passphrase = document.createElement("td");
          if (NetworkConfigurations[wifi]["WiFi"]["Passphrase"]) {
            Passphrase.innerText = NetworkConfigurations[wifi]["WiFi"]["Passphrase"]
          } else if (Security.innerText == "WPA-EAP" && NetworkConfigurations[wifi]["WiFi"]["EAP"]["Password"]) {
            Passphrase.innerText = "Identity: " + NetworkConfigurations[wifi]["WiFi"]["EAP"]["Identity"] + "\nPassword: " + NetworkConfigurations[wifi]["WiFi"]["EAP"]["Password"];
          } else Passphrase.innerText = "NOT FOUND";
          let HiddenSSID = document.createElement("td");
          HiddenSSID.innerText = NetworkConfigurations[wifi]["WiFi"]["HiddenSSID"];
          tr.appendChild(SSID);
          tr.appendChild(Passphrase);
          tr.appendChild(Security);
          tr.appendChild(HiddenSSID);
          document.getElementById("output-networks").appendChild(tr);
        }
      } catch (err) {
        log(err)
      }
    })
  }
}
document.getElementById("export").addEventListener("change", extract)
