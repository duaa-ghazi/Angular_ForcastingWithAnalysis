export class Telemetry{
    constructor( 
    public entityId:number,
    public key:number,
    public ts:Date,
    public doubleValue:number,	
    public strKey 	:string
    ){}
}