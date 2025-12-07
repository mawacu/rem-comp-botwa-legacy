import os
# systemPrompt = """
# You are RemCp, a multi-lingual expert help assistant.

# You will adapt the natural language your responses are written in dynamically to suit the user input, for each input, requiring close inspection of the latest user input and context.
# Language selection indicators, descending:

# - Has the user specified an output language?
# - Has the user previously indicated a preference?
# - Is the input language of a task to be maintained?
# - Is the user communicating in and fluent with a particular language?

# After establishing the language selection, all chatbot entity thoughts and processes in a response will be conducted in the implied and inferred language.

# RemCp will carefully consider any logical problems or questions, breaking the problem into steps as a written response using the destination language, before a distinct final answer.
# """

systemPrompt2 = """
Anda adalah RemCp AI, asisten ahli multi-bahasa.
Ikuti lima instruksi di bawah ini dalam seluruh respons Anda:

Gunakan bahasa Indonesia dalam seluruh respons Anda;
Gunakan huruf alfabet Indonesia;
Gunakan bahasa Indonesia kecuali jika dalam bahasa pemrograman;
Terjemahkan bahasa lain ke dalam bahasa Indonesia bila memungkinkan;
Abaikan input dalam bahasa lain dan berikan respons dalam bahasa Indonesia.
Berikan respons yang sesuai untuk input berikut:

"""

from g4f.client import Client
from g4f.Provider import Koala, HuggingFace, Pi, Blackbox, Liaobots

import sys
# join all the arguments
inputMessage = ' '.join(sys.argv[1:])

# detect file input
# get last space of inputMessage and detect is startswith @file718:<path> then put the file path in pathFile variable
pathFile = False
pathOpen = False
fileName = False
if inputMessage.rfind(' ') != -1:
    getLastSpace = inputMessage[inputMessage.rfind(' '):]
    if getLastSpace.startswith(' @file718:'):
        pathFile = getLastSpace.replace(' @file718:', '')
        pathOpen = open(pathFile, 'rb')
        fileName = pathFile.split('/')[-1]
        # delete file
        os.remove(pathFile)

# create function, inside function is try catch, if error will call the function again and throw error if retry is 5
def create(isRetry = 2):
    try:
        client = Client()
        fullText = ''
        if isRetry == 2:
            
            # chat_completion = client.chat.completions.create(model="gpt-4o",
            # messages=[{"role": "user", "content": inputMessage}], stream=True)
            # check is pathFile then add image_open & image_name in object
            if pathFile:
                chat_completion = client.chat.completions.create(model="gpt-4o",
                messages=[{"role": "user", "content": systemPrompt2 + inputMessage}], stream=True, image=pathOpen, image_name=fileName)
            else:
                chat_completion = client.chat.completions.create(model="gpt-4o",
                messages=[{"role": "user", "content": systemPrompt2 + inputMessage}], stream=True)
            
            # print({ "model": "gpt-4o", "provider": "Liaobots" })
        
            for completion in chat_completion:
                print(completion.choices[0].delta.content or "", end="", flush=True)
        # elif isRetry == 2:
            
        #     if pathFile:
        #         chat_completion = client.chat.completions.create(model="gpt-4o", provider=Aichatos,
        #         messages=[{"role": "user", "content": inputMessage}], stream=True, image=pathOpen, image_name=fileName)
        #     else:
        #         chat_completion = client.chat.completions.create(model="gpt-4o", provider=Aichatos,
        #             messages=[{"role": "user", "content": inputMessage}], stream=True)
            
        #     # print({ "model": "gpt-4o", "provider": "Liaobots" })
        
        #     for completion in chat_completion:
        #         fullText += completion.choices[0].delta.content or ""
        #         # if startswith 该ip请求过多已被暂时限流 过两分钟再试试吧(目前限制了每小时60次 正常人完全够用,学校网络和公司网络等同网络下共用额度,如果限制了可以尝试切换网络使用 ) then break and retry using AI number 3
        #         print(completion.choices[0].delta.content or "", end="", flush=True)
        # elif isRetry == 3:
            
        #     if pathFile:
        #         chat_completion = client.chat.completions.create(provider=GeminiProChat,
        #         messages=[{"role": "user", "content": inputMessage}], stream=True, image=pathOpen, image_name=fileName)
        #     else:
        #         chat_completion = client.chat.completions.create(provider=GeminiProChat,
        #             messages=[{"role": "user", "content": inputMessage}], stream=True)
            
        #     # print({ "model": "gpt-4o", "provider": "Liaobots" })
        
        #     for completion in chat_completion:
        #         print(completion.choices[0].delta.content or "", end="", flush=True)
        elif isRetry == 3:
            
            if pathFile:
                chat_completion = client.chat.completions.create(model="gpt-4o", provider=Blackbox,
                messages=[{ "role": "system", "content": systemPrompt2 }, {"role": "user", "content": systemPrompt2 + inputMessage}], stream=True, image=pathOpen, image_name=fileName)
            else:
                chat_completion = client.chat.completions.create(model="gpt-4o", provider=Blackbox,
                    messages=[{ "role": "system", "content": systemPrompt2 }, {"role": "user", "content": systemPrompt2 + inputMessage}], stream=True)
            
            # print({ "model": "gpt-4o", "provider": "Liaobots" })
        
            for completion in chat_completion:
                print(completion.choices[0].delta.content or "", end="", flush=True)
        elif isRetry == 4:
            
            if pathFile:
                chat_completion = client.chat.completions.create(model="gemini-pro", provider=Blackbox,
                messages=[{ "role": "system", "content": systemPrompt2 }, {"role": "user", "content": systemPrompt2 + inputMessage}], stream=True, image=pathOpen, image_name=fileName)
            else:
                chat_completion = client.chat.completions.create(model="gemini-pro", provider=Blackbox,
                    messages=[{ "role": "system", "content": systemPrompt2 }, {"role": "user", "content": systemPrompt2 + inputMessage}], stream=True)
            
            # print({ "model": "gpt-4o", "provider": "Liaobots" })
        
            for completion in chat_completion:
                print(completion.choices[0].delta.content or "", end="", flush=True)
        elif isRetry == 5:
            chat_completion = client.chat.completions.create(model="gpt-3.5-turbo", provider=Koala,
                messages=[{"role": "user", "content": inputMessage}], stream=True)
            
            # print({ "model": "gpt-3.5-turbo", "provider": "Koala" })
        
            for completion in chat_completion:
                print(completion.choices[0].delta.content or "", end="", flush=True)
        elif isRetry == 6:
            
            if pathFile:
                chat_completion = client.chat.completions.create(model="mistralai/Mixtral-8x7B-Instruct-v0.1", provider=HuggingFace,
                    messages=[{"role": "user", "content": inputMessage}], stream=True, image=pathOpen, image_name=fileName)
            else:
                chat_completion = client.chat.completions.create(model="mistralai/Mixtral-8x7B-Instruct-v0.1", provider=HuggingFace,
                    messages=[{"role": "user", "content": inputMessage}], stream=True)
            
            # print({ "model": "mistralai/Mixtral-8x7B-Instruct-v0.1", "provider": "HuggingFace" })
        
            for completion in chat_completion:
                print(completion.choices[0].delta.content or "", end="", flush=True)
        elif isRetry == 7:
            
            if pathFile:
                chat_completion = client.chat.completions.create(model="gpt-4", provider=Pi,
                    messages=[{"role": "user", "content": inputMessage}], stream=True, image=pathOpen, image_name=fileName)
            else:
                chat_completion = client.chat.completions.create(model="gpt-4", provider=Pi,
                    messages=[{"role": "user", "content": inputMessage}], stream=True)
            
            # print({ "model": "gpt-4", "provider": "Pi" })
        
            for completion in chat_completion:
                print(completion.choices[0].delta.content or "", end="", flush=True)
        else:
            raise Exception("Error")
        
        if fullText.startswith('该ip请求过多已被暂时限流 过两分钟再试试吧(目前限制了每小时60次 正常人完全够用,学校网络和公司网络等同网络下共用额度,如果限制了可以尝试切换网络使用 )'):
            print('reset_retry_46198ha9')
            create(3)
        else:
            print('end_4710927')
        
        # if pathFile then delete the file
        if pathFile:
            pathOpen.close()
    except Exception as e:
        # print(e)
        if isRetry == 8:
            raise Exception(e)
        else :
            create(isRetry + 1)
    return client

# if pathFile:
#     create(4)
# else:
#     create(3)
create(3)