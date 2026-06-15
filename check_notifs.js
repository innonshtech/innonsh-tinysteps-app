const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
  await mongoose.connect('mongodb+srv://rohangadekar07:rohan1903@cluster0.2kosj5b.mongodb.net/xpertance?retryWrites=true&w=majority&appName=Cluster0');
  
  const Notification = mongoose.models.Notification || mongoose.model("Notification", new mongoose.Schema({
    type: String,
    title: String,
    metadata: mongoose.Schema.Types.Mixed,
  }, { strict: false }));

  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(3).lean();
  fs.writeFileSync('notifs.json', JSON.stringify(notifications, null, 2));
  
  await mongoose.disconnect();
}

main().catch(console.error);
