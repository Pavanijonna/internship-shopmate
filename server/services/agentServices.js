require('dotenv').config();
process.env.GOOGLE_API_KEY=process.env.GEMINI_API_KEY;
const dotenv=require('dotenv');
dotenv.config();

const {createReactAgent}=require('@langchain/langgraph/prebuilt');
const {ChatGoogleGenerativeAI}=require('@langchain/google-genai');
const {checkOrderStatusTool,searchProductsTool,getRefundPolicyTool}=require('../tools/shopTools');

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-3.6-flash',
    temperature: 0,
});

const agent=createReactAgent({
    llm: model,
    tools: [checkOrderStatusTool,searchProductsTool,getRefundPolicyTool],
    prompt: 'You are a helpful customer service assisstant for ShopMATE.'+'ShopMATE is an online store.'+'Use the available tools to answer questions about orders.'+'Always be polite and concise.'+'If you cannot fint the information, say so clearly.',
}); 

async function runShopAgent(userMessage){
    const result=await agent.invoke({
        messages:[{role:'user',content:userMessage}],
    });
    return String(result.messages.at(-1).content);
}

module.exports={runShopAgent};