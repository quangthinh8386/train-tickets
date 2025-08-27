import { ConsoleLogger } from "@nestjs/common";

export class MyloggerDev extends ConsoleLogger{
    log(message: string, context: string){
        console.log(`[${context}] | `, message)
    }
}