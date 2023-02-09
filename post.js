const { Configuration, OpenAIApi } = require('openai');
const querystring = require('querystring');
const mailer = require('./mailer')

const configuration = new Configuration({
    apiKey: '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'
  });
const openai = new OpenAIApi(configuration);
const option= {
        model: "text-curie-001",
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
  }




exports.handler = async(event)=>{
    try {
        console.log("event==>",event)
        let body = {};
        if (event.isBase64Encoded) {
            let buff = Buffer.from(event.body, "base64");
            let eventBodyStr = buff.toString('UTF-8');
            console.log("eventBodyStr==>",eventBodyStr)
            body = querystring.parse(eventBodyStr);
        } else {
            body = JSON.parse(event.body);
        }

        console.log("body==>",body)
        let email = body['email']
        let prompt_string = "create detailed  itinery for " + body[ 'Solo/Couple/Family']+"trip for "+body['Trip Duration (Number of days)']+" day and "+body['Trip Duration (Number of nights)']+" night in "+body['Arrival City (Where will your trip begin?)']+"Add must try cusines and must visit popular tourist attractions. I really want to do hiking, food explore."
       
        console.log("prompt_string==>",prompt_string)
       
        // const data  = texthandle(prompt_string)
    
        // console.log("data===>",data)
        let object = { ...option, prompt:prompt_string };
    
        console.log("object====>",object)
        const response = await openai.createCompletion(object);
        console.log("response==>",response.data.choices[0].text)
        await mailer.buildPDF(response,email)    
    
    
        return {
            statusCode: 200,
            headers:{
                // 'Content-Type': `application/JSON`
                'Content-Type': `text/html`
            },
            body:JSON.stringify(response.data.choices[0].text)
        }
        
    } catch(er) {
        console.log("err1====>",er);
    }
    
}


