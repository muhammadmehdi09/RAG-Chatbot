import OpenAI from "openai";
import "dotenv/config"
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});
const index = pc.index("testing")

const messages = []

const createEmbeddings = async (query) => {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
    });
    return embedding
}

const dataFetcher = async (query) => {
    const embeddings = await createEmbeddings(query)
    const embedding = embeddings.data[0].embedding
    const queryResponse = await index.namespace("mehdi").query({
        topK: 10,
        vector: embedding,
        includeMetadata: true,
        includeValues: false
    });
    const data = queryResponse.matches.map((data, i) => {
        return `Data ${i + 1}: ${data.metadata.text}`
    })

    const finalData = data.join("\n")
    return finalData
}

const manageData = (data) => {
    messages[0] = {
        role: "system",
        content: `
        You are a helpful AI assitant that has to answer questions related to a web developer named Mehdi. Give answer according to data mentioned below and do not mention that the answer is in Chunk Number # just use the needed information and change the answer to better vocablary. If answer is not mentioned politely say I don't know. If user asks anything of topic just answer it normally.

        Data: "${data}"
        `
    }
}

const chat = async (user_query) => {
    const data = await dataFetcher(user_query)
    manageData(data)
    messages.push({
        role: "user",
        content: user_query
    })

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
    })

    messages.push(completion.choices[0].message)

    const aiRes = completion.choices[0].message.content
    return aiRes
}

export default chat