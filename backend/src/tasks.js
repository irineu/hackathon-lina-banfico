import winston from 'winston';
import mongoose from 'mongoose';
import express from 'express';
import gzip from 'compression';
import bodyparser from 'body-parser'; //urlencoded, json
import fs from 'fs';
import path from 'path'
import httpUtils from './util/http.js';
import morgan from 'morgan';
import http from 'http';
import routes from './routes/index.js';

const loadCFG = async () => {
    let customConfig = process.argv[2];

    try{
        let cfgPath = customConfig ? path.resolve(`config-${customConfig}.json`) : path.resolve(`config-default.json`);
        global.config = JSON.parse(fs.readFileSync(cfgPath));

        const logFormat = winston.format.printf(({level, message, timestamp}) => {
            let log = `${timestamp} ${level}:`;

            if(typeof message === 'object'){
                message.forEach((m) => {
                    if(typeof m === 'object'){
                        log += `  ${JSON.stringify(m)}`;
                    }else{
                        log += `  ${m}`;
                    }
                });
            }else{
                log += `  ${message}`;
            }

            return log;
        });

        global.log = new winston.createLogger({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                //winston.format.align(),
                logFormat
            ),
            transports: [
                new winston.transports.Console({}),
            ],
        });

    }catch(e){
        console.error(e);
        process.exit(1);
    }
}

const connectDB = async () => {
    global.log.info(['TASKS', 'CONNECT-DB', 'Connecting to Database...']);
    try{
        await mongoose.connect(`mongodb://${global.config.db.host}:${global.config.db.port}/${global.config.db.name}`, {useNewUrlParser: true, useUnifiedTopology: true});
    }catch(e){
        global.log.error(['TASKS', 'CONNECT-DB', e]);
        throw new Error(e);
    }
    global.log.info(['TASKS', 'CONNECT-DB', 'Connected!']);
}

const setupHTTPServer = async () => {
    return new Promise((resolve, reject) => {
        global.log.info(['TASKS', 'HTTP-SERVER', 'Preparaing HTTP Server winth args:', global.config.http]);

        let app = express();

        app
        .use(gzip())
        .use(bodyparser.urlencoded({extended: true}))
        .use(bodyparser.json())
        .use(morgan('dev'))
        .use(httpUtils.filter.enableCORS)
        .use(httpUtils.filter.errorHandler)
        .use(express.static('public'))
        //.use(express.static('frontend'));


        let httpServer = http.createServer(app).listen(global.config.http.port, () => {
            global.log.info(['TASKS', 'HTTP-SERVER', 'ready at:', `http://${global.config.http.host}:${global.config.http.port}/`]);
            global.httpServer = app;

            resolve();

        }).on('error', (err) => {
            reject(err);
        });
    });
}

const mapRoutes = async () => {
    routes.load();
}

export { loadCFG, connectDB, setupHTTPServer, mapRoutes };