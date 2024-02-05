const Trello = require('node-trello');
import dotenv from 'dotenv';

dotenv.config();

const trello = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_API_TOKEN);

async function getAllBoards() {
    await trello.get('/1/members/me/boards', (err: any, data: any) => {
        if (err) throw err;
    //    console.log(data.map((d: any) => { return { id: d.id, name: d.name } }));
    });
}  

async function getAllBoardsList(boardId: string){
    await trello.get(`/1/boards/${boardId}/lists`, (err: any, lists: any) => {
        if (err) throw err;
        lists.forEach((list: any) => {
        //    console.log(`List name: ${list.name}, List id: ${list.id}`);
        });
    });
}

async function CreateCard(ListId : string, CardName: string, CardDescription: string, Labels: string[]=[]){
        const card = await trello.post(`/1/cards`, { name: CardName, desc: CardDescription,idList: ListId, idLabels: Labels }, (err: any, data: any) => {
            if (err) throw err;
        });
        return card;
}


export { getAllBoards, getAllBoardsList, CreateCard};