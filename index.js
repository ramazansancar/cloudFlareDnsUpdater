const axios = require('axios');
var http = require('http');
const cron = require('node-cron');
const dotenv = require('dotenv');
dotenv.config();

// Temp Variable
let recordsA = "";

const nowTime = (i = 1) => {
    const dates = new Date();
    const year = dates.getFullYear();
    const month = String([dates.getMonth() + 1]).padStart(2, "0");
    const day = String(dates.getDate()).padStart(2, "0");
    const hour = String(dates.getHours()).padStart(2, "0");
    const minute = String(dates.getMinutes()).padStart(2, "0");
    const second = String(dates.getSeconds()).padStart(2, "0");
    const milisecond = String(dates.getMilliseconds()).padStart(3, "0");
    const timezoneOffset = -dates.getTimezoneOffset() / 60; // Convert to hours and invert sign
    if (i == -1) return (day + `/` + month + `/` + year + ` ` + hour + `:` + minute + `:` + second + `:` + milisecond)
    else if (i == 1) return (day + `/` + month + `/` + year + ` ` + hour + `:` + minute + `:` + second);
    else if (i == 2) return day + `/` + month;
    else if (i == 3) return year + `_` + month + `_` + day;
    else if (i == 4) return (day + "-" + month + "-" + year + "_" + hour + "-" + minute + "-" + second);
    else if (i == 5) return (year + `-` + month + `-` + day + ` ` + hour + `:` + minute + `:` + second + `:` + milisecond)
    else return `${year}-${month}-${day} ${hour}:${minute}:${second}.${milisecond} GMT${timezoneOffset > 0 ? "+" : "-"}${String(Math.abs(timezoneOffset)).padStart(2, "0")}:00`;
};

// 15 Minutes
var job = cron.schedule('*/15 * * * *', async () => {
    console.log(`[${nowTime(1)}]`,'Checking DNS Records');
    const agent = new http.Agent({ keepAlive: true }); // Ipv4 Support
    let ipAdressApi = await axios.get('https://api.cloudflare.com/cdn-cgi/trace', { httpAgent: agent });
    ipAdressApi = ipAdressApi.data.split('\n').filter((item) => item.includes('ip'))[0].split('=')[1];
    console.log(`[${nowTime(1)}]`,'My Ip Adress:',ipAdressApi);

    const api = axios.create({
        baseURL: 'https://api.cloudflare.com/client/v4/',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
            'X-Forwarded-For': '*'
        },
        transformRequest: [
          (data) => {
            return JSON.stringify(data);
          },
        ],
        transformResponse: [
          (data) => {
            return JSON.parse(data);
          },
        ],
    });

    /*
    // Request Interceptor (Request) | Response Interceptor (Response)
    api.interceptors.request.use(
        (config) => {
            console.log('Request Interceptor', config);
            return config;
        },
        (error) => {
            console.log('Request Interceptor Error', error);
            return Promise.reject(error);
        }
    );*/

    // Token Verify
    api.get('user/tokens/verify').then((response) => {
        if(response.data.success){
            console.log(`[${nowTime(1)}]`,'Success Verify Token');
            // Zone List
            api.get('zones').then((response) => {
                if(response.data.success){
                    console.log(`[${nowTime(1)}]`,'Success Zones');
                    response.data.result.filter((item) => {
                        if(item.name === process.env.CLOUDFLARE_DOMAIN){
                            // DNS Records List
                            api.get(`zones/${item.id}/dns_records`).then((response) => {
                                if(response.data.success){
                                    console.log(`[${nowTime(1)}]`,'Success DNS Records');
                                    response.data.result.filter((item) => {
                                        if(item.type === 'A' && item.name === process.env.CLOUDFLARE_DOMAIN){
                                            console.log(`[${nowTime(1)}]`,'Success DNS Records Filter', item.id, item.name, item.type, item.content)
                                            recordsA = item.content;
                                            if(recordsA !== ipAdressApi){
                                                console.log(`[${nowTime(1)}]`,'Success DNS Record - Updated!', item.id, item.name, item.type, item.content);
                                                // DNS Records Update
                                                api.put(`zones/${item.zone_id}/dns_records/${item.id}`, {
                                                    type: 'A',
                                                    name: process.env.CLOUDFLARE_DOMAIN,
                                                    content: ipAdressApi,
                                                    ttl: 1,
                                                    proxied: true
                                                }).then((response) => {
                                                    if(response.data.success){
                                                        console.log(`[${nowTime(1)}]`,'Success DNS Records Update', response.data.result.id, response.data.result.name, response.data.result.type, response.data.result.content);
                                                    }else{
                                                        console.log('Error DNS Records Update', response.data.errors[0].message, response.data.errors[0].code);
                                                    }
                                                }).catch((error) => {
                                                    console.error(error);
                                                });
                                            }else{
                                                console.log(`[${nowTime(1)}]`,'Success DNS Record - No Update!', item.id, item.name, item.type, item.content);
                                            }
                                        }
                                    });
                                }else{
                                    console.log(`[${nowTime(1)}]`,'Error DNS Records', response.data.errors[0].message, response.data.errors[0].code);
                                }
                            }).catch((error) => {
                                console.error(error);
                            });
                        }
                    });
                }else{
                    console.log(`[${nowTime(1)}]`,'Error Zones', response.data.errors[0].message, response.data.errors[0].code);
                }
            }).catch((error) => {
                console.error(error);
            });
        }else{
            console.log(`[${nowTime(1)}]`,'Error Verify Token', response.data.errors[0].message, response.data.errors[0].code);
        }
    }).catch((error) => {
        console.error(error);
    });
},{
    scheduled: true,
    timeZone: 'Europe/Istanbul'
});
job.start();
