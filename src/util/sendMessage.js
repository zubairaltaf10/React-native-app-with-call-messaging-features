import {channelManager} from '../components/chat/firebase'
import firebase from '../services/firebase'
export default sendMessage = async (user, channel, inputValue, downloadURL) => { 
  console.log(channel.id, "CHANNEL IDDD")
   await firebase.firestore().collection('channels').doc(channel.id).get().then(doc => {
      if(doc){
        if (doc.exists){
          console.log("DATA EXISTSSS")
            channelManager
            .sendMessage(user, channel, inputValue, downloadURL)
            .then(response => {
              if (response.error) {
                alert(error);
              }
        })  
        } else {
          console.log("DATA NOT EXISTSS")
          channelManager.createChannel(user, channel.participants).then((resp) => {
            channelManager
            .sendMessage(user, channel, inputValue, downloadURL)
            .then(response => {
              if (response.error) {
                alert(error);
              }
            });
        })  
        }
      }else{
        console.log("No DOC ")
      }
    })
  
      
  };


  