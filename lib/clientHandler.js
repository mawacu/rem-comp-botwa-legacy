const fs = require('fs')
const fetch = require('node-fetch')
const snappy = require('snappy')

const MessageType = { "document": "documentMessage", "video": "videoMessage", "image": "imageMessage", "audio": "audioMessage", "sticker": "stickerMessage", "buttonsMessage": "buttonsMessage", "extendedText": "extendedTextMessage", "contact": "contactMessage", "location": "locationMessage", "liveLocation": "liveLocationMessage", "product": "productMessage", "list": "listMessage", "listResponse": "listResponseMessage" }
const mediaType = ["imageMessage", "videoMessage", "stickerMessage", "audioMessage", "documentMessage", "documentWithCaptionMessage"]
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

module.exports = async (rem, message, _userDb) => {
    const {
        proto,
        prepareWAMessageMedia,
        generateWAMessageFromContent
    } = await import('baileys')

    async function sendTextWithMentions (from, teks, isReply = '') {
        if(!teks.includes('@')) {
            //console.log('a')
            if(message?.isConsole) return console.log(teks)
            return await rem.sendMessage(from, { text: teks })
        } else {
            let teks2 = teks.replace(/\n/g, " ");
            const testTags = teks2.trim().split(' ')
            let tags = []
            for(let i = 0; i < testTags.length; i++) {
                if(testTags[i].includes('@')) {
                    const testTags2 = testTags[i].replace('@', '') + '@s.whatsapp.net'
                    if(!isNaN(testTags2.split('@')[0])) {
                       tags.push(testTags2)
                    }
                }
            }
            let option = {}
            if(isReply != '') {
                option = { quoted: isReply }
            }

            if(message?.isConsole) return console.log(teks)

            if(tags == [] || tags == '') {
                return await rem.sendMessage(from, { text: teks }, { ephemeralExpiration: message?.message?.extendedTextMessage?.contextInfo?.expiration })
            } else {
                return await rem.sendMessage(from, { text: teks, mentions: tags }, Object.assign(option, { ephemeralExpiration: message?.message?.extendedTextMessage?.contextInfo?.expiration }))
            }
        }
    }

    // example message
    // {
    //     interactiveMessage: {
    //         type: "button",
    //         body: {
    //             text: 'Click the button',
    //             options: [],
    //         },
    //         footer: {
    //             text: "footer"
    //         },
    //         nativeFlowMessage: {
    //             messageVersion: "1",
    //             buttons: [{
    //                 buttonParamsJson: 'test',
    //                 name: 'test',
    //             }, ],
    //         },
    //     },
    // };
    async function sendTextWithFooter (from, text, footer, options = {}) {
        if(message?.isConsole) return console.log('unsupported format | textFooter')

        const messagePayload = {
            interactiveMessage: {
                type: "button",
                body: {
                    text,
                    options: [],
                },
                footer: {
                    text: footer
                },
                nativeFlowMessage: {}
            }
        }
        return await rem.relayMessage(from, messagePayload, Object.assign(options, { ephemeralExpiration: message?.message?.extendedTextMessage?.contextInfo?.expiration }))
    }

    async function sendButtons (from, body, button, header = '', footer = '', options = {}, optionsText = {}, getMetadata = false, isSendNewButton = true) {
        if(message?.isConsole) return console.log('unsupported format | buttons')

        let arrayButton = button
        if(_userDb?.isLegacyButton || ((_userDb?.isLegacyButton === undefined) || (_userDb?.isLegacyButton === null)) || getMetadata || !isSendNewButton) {
            const textId = `${arrayButton.map((button) => button.id).join('|r|')}`
            const idMetadata = snappy.compressSync(textId)
            const textBodyButtons = `${body}\n\n${arrayButton.map((button, i) => `${i + 1}. ${button.text}`).join('\n')}\n\nmetadata:${Buffer.from(idMetadata).toString('base64')}`
            if(getMetadata) return textBodyButtons
            return await rem.sendMessage(from, Object.assign(optionsText, { text: textBodyButtons }), Object.assign(options, { ephemeralExpiration: message?.message?.extendedTextMessage?.contextInfo?.expiration }))
        } else {
            arrayButton = button.map((buttonArr) => {
                return {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: buttonArr.text, id: buttonArr.id })
                }
            })
            let msgsButtons = generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: body
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: footer
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                title: header
                            }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: arrayButton,
                            })
                        })
                    }
                }
            }, {})
            return await rem.relayMessage(from, msgsButtons.message, { })
        }
    }

    async function sendList (from, body, button, header = '', footer = '', options = {}, optionsText = {}) {
        if(message?.isConsole) return console.log('unsupported format | listButtons')

        let arraySections = button

        let textFormat = ''
        let idButtonFormat = ''
        let countNumber = 1
        for(let i = 0; i < arraySections.length; i++) {
            let insideRow = `\n*${arraySections[i].title}*`
            let idInsideRow = ''
            for(let j = 0; j < arraySections[i].rows.length; j++) {
                insideRow += `\n   ${countNumber}. ${arraySections[i].rows[j].title}`
                idInsideRow += `${arraySections[i].rows[j].rowId}|r|`
                countNumber++
            }
            textFormat += insideRow
            idButtonFormat += idInsideRow
        }
    
        const idMetadata = snappy.compressSync(idButtonFormat)
        const textBodyButtons = `--${header}--\n\n${body}\n${textFormat}\n\nlmeta:${Buffer.from(idMetadata).toString('base64')}`
        return await rem.sendMessage(from, Object.assign(optionsText, { text: textBodyButtons }), Object.assign(options, { ephemeralExpiration: message?.message?.extendedTextMessage?.contextInfo?.expiration }))
    }
    
    async function sendButtonsImage (from, body, imageFile, button, header = '', footer = '', options = {}) {
        if(message?.isConsole) return console.log('unsupported format | buttonsImage')

        let imageFileFilter = undefined
        if(base64Regex.test(imageFile)) {
            imageFileFilter = Buffer.from(imageFile, 'base64')
        } else if(Buffer.isBuffer(imageFile)) {
            imageFileFilter = imageFile
        } else if(imageFile.startsWith('https://') || imageFile.startsWith('http://')) {
            var response = await fetch(imageFile)
            imageFileFilter = await response.buffer()
        } else if(Array.isArray(imageFile)) {
            if(type == MessageType.image) {
                if(imageFile.url.startsWith('https://') || imageFile.url.startsWith('http://')) {
                    var response = await fetch(imageFile.url)
                    imageFileFilter = await response.buffer()
                } else if(Buffer.isBuffer(imageFile.url)) {
                    imageFileFilter = imageFile.url
                }
            }
        } else {
            imageFileFilter = await fs.readFileSync(imageFile)
        }
        
        let arrayButton = button
    
        const textId = `${arrayButton.map((button) => button.id).join('|r|')}`
        const idMetadata = snappy.compressSync(textId)
        const textBodyButtons = `${body}\n\n${arrayButton.map((button, i) => `${i + 1}. ${button.text}`).join('\n')}\n\nmetadata:${Buffer.from(idMetadata).toString('base64')}`
        
        return await rem.sendFile(from, imageFileFilter, 'image.jpg', textBodyButtons, '', MessageType.image)         
    }

    // [{
    //     body: 'text',
    //     header: {}, // https://whiskeysockets.github.io/Baileys/interfaces/proto.Message.InteractiveMessage.IHeader.html
    //     footer: 'text',
    //     buttons: [{}]
    //     // example buttons
    //     {
    //         //                 "name": "single_select",
    //         //                 "buttonParamsJson": "{\"title\":\"title\",\"sections\":[{\"title\":\"title\",\"highlight_label\":\"label\",\"rows\":[{\"header\":\"header\",\"title\":\"title\",\"description\":\"description\",\"id\":\"id\"},{\"header\":\"header\",\"title\":\"title\",\"description\":\"description\",\"id\":\"id\"}]}]}"
    //         //               },
    //         //               {
    //         //                 "name": "quick_reply",
    //         //                 "buttonParamsJson": "{\"display_text\":\"quick_reply\",\"id\":\"message\"}"
    //         //               },
    //         //               {
    //         //                  "name": "cta_url",
    //         //                  "buttonParamsJson": "{\"display_text\":\"url\",\"url\":\"https://www.google.com\",\"merchant_url\":\"https://www.google.com\"}"
    //         //               },
    //         //               {
    //         //                  "name": "cta_call",
    //         //                  "buttonParamsJson": "{\"display_text\":\"call\",\"id\":\"message\"}"
    //         //               },
    //         //               {
    //         //                  "name": "cta_copy",
    //         //                  "buttonParamsJson": "{\"display_text\":\"copy\",\"id\":\"123456789\",\"copy_code\":\"message\"}"
    //         //               },
    //         //               {
    //         //                  "name": "cta_reminder",
    //         //                  "buttonParamsJson": "{\"display_text\":\"cta_reminder\",\"id\":\"message\"}"
    //         //               },
    //         //               {
    //         //                  "name": "cta_cancel_reminder",
    //         //                  "buttonParamsJson": "{\"display_text\":\"cta_cancel_reminder\",\"id\":\"message\"}"
    //         //               },
    //         //               {
    //         //                  "name": "address_message",
    //         //                  "buttonParamsJson": "{\"display_text\":\"address_message\",\"id\":\"message\"}"
    //         //               },
    //         //               {
    //         //                  "name": "send_location",
    //         //                  "buttonParamsJson": ""
    //         //               }
    // }]
    async function sendScrollMessage (from, body, scrollFormat, options = {}) {
        if(message?.isConsole) return console.log('unsupported format | scrollMessage')
        
        const payloadCarousel = {
            cards: [],
            messageVersion: 1,
        }

        for(let i = 0; i < scrollFormat.length; i++) {
            if(scrollFormat[i]?.header?.hasMediaAttachment) {
                const scrollHeaderType = Object.keys(scrollFormat[i].header)
                // check is mediaType
                let isMediaTypeScroll = undefined
                for(let j = 0; j < scrollHeaderType.length; j++) {
                    if(mediaType.includes(scrollHeaderType[j])) {
                        isMediaTypeScroll = scrollHeaderType[j]
                    }
                }

                let typeMediaScroll = undefined
                if(isMediaTypeScroll === 'imageMessage') typeMediaScroll = 'image'
                if(isMediaTypeScroll === 'videoMessage') typeMediaScroll = 'video'
                if(isMediaTypeScroll === 'audioMessage') typeMediaScroll = 'audio'
                if(isMediaTypeScroll === 'documentMessage') typeMediaScroll = 'document'

                const imageSendScroll = (await prepareWAMessageMedia({
                    [typeMediaScroll]: scrollFormat[i].header[isMediaTypeScroll]
                }, {
                    logger: rem.ws.config.logger,
                    userJid: rem.user.id,
                    upload: rem.waUploadToServer
                }))[isMediaTypeScroll]
                scrollFormat[i].header[isMediaTypeScroll] = imageSendScroll
            }

            const card = {
                body: {
                    text: scrollFormat[i].body
                },
                header: scrollFormat[i].header,
                footer: {
                    text: scrollFormat[i].footer
                },
                nativeFlowMessage: {
                    buttons: scrollFormat[i].buttons
                }
            }
            payloadCarousel.cards.push(card)
        }

        const payload = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        carouselMessage: payloadCarousel
                    },
                },
            },
        }

        if(body) payload.viewOnceMessage.message.interactiveMessage.body = { text: body }

        let msgsTest5670 = generateWAMessageFromContent(
            from, payload, {}
        );

        return rem.relayMessage(from, msgsTest5670.message, {})
    }

    async function sendEditMessage (from, key, text, optionsText = {}, options = {}) {
        if(message?.isConsole) return console.log('unsupported format | editMessage')

        return await rem.sendMessage(from, Object.assign(optionsText, { text, edit: key }), options)
    }

    return { sendTextWithMentions, sendTextWithFooter, sendButtons, sendList, sendButtonsImage, sendScrollMessage, sendEditMessage }
}