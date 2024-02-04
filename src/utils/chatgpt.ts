import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TEST_KEY
});

async function send_ticket(message: string) {
    if (!message) {
        return console.error('Please provide a message');
    }
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Please reply in one word (backend or frontend or both) is this issue a backend issue or a frontend issue? ' + message }],
    model: 'gpt-3.5-turbo',
  });
  return chatCompletion.choices[0].message.content;
  //console.log(chatCompletion.choices[0].message.content);
}

export default send_ticket;