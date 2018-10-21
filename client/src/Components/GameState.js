import React from 'react';
import App from './App.js'

const numEvent = 3

export default class GameState extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            percentage: {africa:0, na:1, sa:0, asia:0, eu:0, pacific:0},
            factories: {africa:0, na:1, sa:0, asia:0, eu:0, pacific:0},
            skills: {bribe:1, pr:1, ads:1, product:1, profit:1},
            scores: {money:1000000, reputation:100, efficiency:1},
            isEvents: false,
            events: { money: -1, reputation: -1 },
            isFactoryChanged: false,
            factoryChange: [0, 0, 0, 0, 0],
            skillPointLeft: 35
        }
        this.changeSkill = this.changeSkill.bind(this);
        this.changeFactory = this.changeFactory.bind(this);
    };

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
        this.check = 0;
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    changeFactory(c) {
        const sc = this.state.scores;
        const f = this.state.factories;
        
        const africa = f.africa + c[0];
        const na = f.na + c[1];
        const sa = f.sa + c[2];
        const asia = f.asia + c[3];
        const eu = f.eu + c[4];
        const pacific = f.pacific + c[5];

        if (sc.money > 100)
            {
            this.setState({
                scores: {
                    money: sc.money - 500, 
                    reputation: sc.reputation, 
                    efficiency: sc.efficiency
                },
                factories: {
                    africa: africa,
                    na: na,
                    sa: sa,
                    asia: asia,
                    eu: eu,
                    pacific: pacific
                }
            });
        }
    }

    changeSkill(c) {
        const sc = this.state.scores;
        const s = this.state.skills;
        const l = this.state.skillPointLeft;
        const bribe = s.bribe + c[0];
        const pr = s.pr + c[1];
        const ads = s.ads + c[2];
        const product = s.product + c[3];
        const profit = s.profit + c[4];
        const temp_ = [bribe, pr, ads, product, profit]
        const temp = temp_.filter(skill => skill < 0 || skill > 20)
        const point = c.reduce((a, b) => a + b, 0);
        if (((l > 0 && temp.length === 0) || (l === 0 &&  temp.length !== 0))
         && sc.money > 100)
            {
            this.setState({
                scores: {
                    money: sc.money - 1000, 
                    reputation: sc.reputation, 
                    efficiency: sc.efficiency + (temp_[0] + temp_[4]) / 100
                },
                skills: {
                    bribe: bribe,
                    pr: pr,
                    ads: ads,
                    product: product,
                    profit: profit
                },
                skillPointLeft: l-point
            });
        }
    }

    updateScores(past) {
        const f = past.factories;
        const sc = past.scores;
        const sk = past.skills;
        var moChange = sc.reputation * (f.africa + f.na + f.sa + f.asia + f.eu + f.pacific) / 99;
        var reChange = sc.efficiency / (sk.pr + sk.ads + sk.product);
        var newScore = {
            money: Math.round((sc.money + moChange)*100) / 100, 
            reputation: Math.round((sc.reputation - reChange)*100) / 100, 
            efficiency: sc.efficiency };
        return newScore;
    }

    updatePercen(past) {
        const p = past.percentage;
        const f = past.factories;
        const e = past.scores.efficiency;
        const sk = past.skills;
        const temps = [
            f.africa * sk.bribe, 
            f.na * sk.pr, 
            f.sa * (sk.ads + sk.product) / 2, 
            f.asia * sk.ads, 
            f.eu * (sk.pr + sk.ads) / 2,
            f.pacific * sk.product
        ];
        const c = temps.map((temp) => temp * e / 600)
        var newPercen = {
            africa:p.africa+c[0], 
            na:p.na+c[1], 
            sa:p.sa+c[2], 
            asia:p.asia+c[3], 
            eu:p.eu+c[4], 
            pacific:p.pacific+c[5]
        }
        return newPercen
    }

    spawn(source) {
        if ((source > 200 && Math.random() > 0.97) || this.check > 25) { 
            const e = Math.round(numEvent / 3 * Math.random());
            this.check = 0;
            return e;
        }
        else if ((source < 200 && source > 50 && Math.random() > 0.98) || this.check > 30) {
            const e = Math.round(numEvent / 3 * Math.random());
            this.check = 0;
            return e + numEvent / 3;
        }
        else if ((source < 50 && Math.random() > 0.97) || this.check > 20) {
            const e = Math.round(numEvent / 3 * Math.random());
            this.check = 0;
            return e + numEvent / 3 * 2
        }
        this.check = this.check + 1;
        return -1;
    }

    updateEvent(past) {
        const money = this.spawn(past.money / 1000);
        const reputation = this.spawn(past.reputation);
        if (money + reputation !== -2) {
            const newEvent = {money: money, reputation: reputation};
            return newEvent 
        }
        else {
            return {money: -1, reputation: -1};
        }
    }

    tick() {
        this.setState((state) => ({
            scores: this.updateScores(state),
            percentage: this.updatePercen(state),
            events: this.updateEvent(state.scores)
          }));
    }

    endGame() {
        const sc = this.state.scores;
        const pc = this.state.percentage;
        if (sc.money === 0 || sc.reputation === 0) {
            clearInterval(this.timerID);
            return "bankrupt";
        }
        else if (pc.africa === 100 && pc.na === 100 && pc.sa === 100 && 
            pc.asia === 100 && pc.eu === 100 && pc.pacific === 100) {
            clearInterval(this.timerID);
            return "conquered";
        }
        else {
            return "continue";
        }
    }

    pause() {
        clearInterval(this.timerID);
    }

    render() {
        const scores = this.state.scores;
        const skills = this.state.skills;
        const events = this.state.events;
        const factories = this.state.factories;
        const percentage = this.state.percentage;
        const skillPointLeft = this.state.skillPointLeft;
        const gameState = this.endGame();
        return (
            <div>
                <App 
                gameState = {gameState}
                changeSkill = {this.changeSkill} 
                changeFactory = {this.changeFactory} 
                events = {events}
                scores = {scores}
                factories = {factories}
                skills = {skills}
                percentage = {percentage}
                skillPointLeft = {skillPointLeft}
                pause={this.pause}
                resume={this.tick}
                />
            </div>
        );
    }
}
