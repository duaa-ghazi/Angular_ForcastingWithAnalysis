export class PlotData{
    constructor(
        public x:string[],
        public y:number[]
    ){}
}

export class PlotPoint{
    constructor(
        public x:Date,
        public y:number
    ){}
}