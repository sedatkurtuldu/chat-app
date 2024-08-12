const express = require("express");
const { firestore } = require("../firebase");

const router = express.Router();

router.get("/messages", async (req, res) => {
  const { chatPartnerId, currentUserId } = req.query;

  if (!chatPartnerId || !currentUserId) {
    return res.status(400).send("chatPartnerId and currentUserId are required");
  }

  try {
    const messagesRef = firestore.collection("Messages");

    const querySnapshot = await messagesRef
      .where("ReceiverUserId", "in", [chatPartnerId, currentUserId])
      .where("SenderUserId", "in", [chatPartnerId, currentUserId])
      .orderBy("SendTime")
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send("Mesaj Bulunamadı!");
    }

    const messages = querySnapshot.docs.map(doc => doc.data());

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages: ", error);
    res.status(500).send("Error fetching messages");
  }
});

router.post("/sendMessage", async (req, res) => {
  const { chatPartnerId, currentUserId, message } = req.body;

  if (!chatPartnerId || !currentUserId || !message) {
    return res.status(400).send("chatPartnerId, currentUserId, and message are required");
  }

  try {
    const messagesRef = firestore.collection("Messages");

    const newMessage = {
      ReceiverUserId: chatPartnerId,
      SenderUserId: currentUserId,
      Message: message,
      SendTime: new Date().toISOString(),
      Status: 1,
    };

    await messagesRef.add(newMessage);

    res.status(201).send("Message sent successfully");
  } catch (error) {
    console.error("Error sending message: ", error);
    res.status(500).send("Error sending message");
  }
});

router.post("/updateMessageStatus", async (req, res) => {
  const { chatPartnerId, currentUserId } = req.body;

  if (!chatPartnerId || !currentUserId) {
    return res.status(400).send("chatPartnerId and currentUserId are required");
  }

  try {
    const messagesRef = firestore.collection("Messages");

    const querySnapshot = await messagesRef
      .where("ReceiverUserId", "in", [chatPartnerId, currentUserId])
      .where("SenderUserId", "in", [chatPartnerId, currentUserId])
      .where("Status", "==", 1)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send("No messages found to update");
    }

    const batch = firestore.batch();
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { Status: 2 });
    });

    await batch.commit();

    res.status(200).send("Message statuses updated successfully");
  } catch (error) {
    console.error("Error updating message statuses: ", error);
    res.status(500).send("Error updating message statuses");
  }
});


module.exports = router;
