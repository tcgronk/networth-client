import React, {Component} from 'react';

import './Networth.css'
import NetworthPie from './NetworthPie';
import GoalsForm from './Goals/GoalsForm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Overtime from "./Overtime/Overtime"
import Resources from './Resources/Resources'
import ApiContext from './ApiContext'
// import LineChart from './LineChart'
import { faCoffee, faCreditCard, faLandmark, faHandHoldingUsd, faPiggyBank, faMoneyBillAlt, faMoneyCheck, faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import AdviceApiService from '../services/advice-service'
import CalculationApiService from "../services/calculations-service"
import WalletsApiService from '../services/wallet-service'
import { library } from "@fortawesome/fontawesome-svg-core";

library.add( faCoffee,
  faCreditCard, faLandmark, faHandHoldingUsd, faPiggyBank, faMoneyBillAlt, faMoneyCheck, faQuestionCircle)



export default class Networth extends Component {
  constructor(props){
    super(props);
    this.state={
        CreditCardDebt: 0,
        InvestmentsStocksBonds: 0,
        Loans: 0,
        Savings: 0,
        otherDebt: 0,
        otherAssets: 0,
        total: '$0.00',
        entries: [{}],
        networth: false, 
        error: '',
        id:0,
        showDescription:false,
        advice:[{}],
        calculations:[],
        wallet:[]
    }
  }
  static contextType = ApiContext 

  componentDidMount() {
    this._mounted = true;
    Promise.all([
      AdviceApiService.getAdvice(),
      CalculationApiService.getCalculations(),
      WalletsApiService.getWallets()
      
      ])

      .then((res) => {
        if(this._mounted) {
        return Promise.all([
          this.interval = setTimeout(
            () => this.setState({entries: [res[1]],wallet:res[2], advice: [res[0]]}),
            2400
          )
       
        ])}
      })
      .catch(error => {
        console.error({ error });
      });

  
  }


  handleDeleteEntry=()=>{
    CalculationApiService.getCalculations()
    .then(res=>
      this.setState({entries: [res],error: ''})  
    )
   

  }
  handleNetworth=(e)=>{
    e.preventDefault();
    let name= (e.target.name).replace(/[\s()/]/g,'')
    let value=(e.target.value).replace(/[^0-9.-]+/g,'')
    if(value===''){
      value=0
    }

    this.setState({networth: false, [`${name}`]: value})
  }


  handleSubmit(e){
    e.preventDefault();
    let options = { style: 'currency', currency: 'USD' };
    let numberFormat = new Intl.NumberFormat('en-US', options);
    let credit=parseFloat(this.state.CreditCardDebt)
    let investments=parseFloat(this.state.InvestmentsStocksBonds)
    let savings = parseFloat(this.state.Savings)
    let loans = parseFloat(this.state.Loans)
    let total=investments  - credit  + savings - loans 
    total=numberFormat.format(total)
    let networth_total_value= Number(total.replace(/[^0-9.-]+/g,""))
    let networth_total=total
    let networth_investments= investments
    let networth_loans=loans
    let networth_credits=credit
    let networth_savings=savings
    if(this.state.entries[0] != null && this.state.entries[0].length>=12){
      this.setState({error: "The maximum historical networth is 12. Please delete some of your past entries.", 
      total: ''})
    }
    else CalculationApiService.postCalculations(networth_total,networth_total_value , networth_investments, networth_loans, 
    networth_credits, networth_savings) 
    .then(res=>{
      this.setState({total: total})
    })   
    .catch(res=>{
      this.setState({error: res.error})
    })
  }
  componentDidUpdate(){ 
    this._mounted = true
    CalculationApiService.getCalculations()
    .then(res=>{
      if(this._mounted) {
        this.setState({entries: [res]})
      }}
      )
    .catch(res=>{
      this.setState({error: res.error})
    })
  }
  componentWillUnmount(){
    this._mounted = false;
}
  icons=(input)=>{
    if(input==='faCreditCard'){
      return  faCreditCard
    }
    if(input==='faLandmark'){
      return  faLandmark
    }
    if(input==='faHandHoldingUsd'){
      return  faHandHoldingUsd
    }
    if(input==='faPiggyBank'){
      return  faPiggyBank
    }
    if(input==='faMoneyCheck'){
      return  faMoneyCheck
    }
    if(input==='faMoneyBillAlt'){
      return  faMoneyBillAlt
    }
  }
// max inputs is 9 digits

  render(){
  let wallets = this.state.wallet
  if (wallets.length>0){
  return (
    <ApiContext.Provider value={{
      entries: this.state.entries, 
      handleDeleteEntry: this.handleDeleteEntry,
      advice: this.state.advice
    }}> 
    <div className="Networth">
      <h1>Your personalized financial planning dashboard:</h1>
      <div className='profile'>
        <div className="wallet">
        <h2>Portfolio: </h2>
        </div>
        <br/>
        <div className="test">
        <div className="WalletTitle">
          <NetworthPie credit={this.state.CreditCardDebt} loans={this.state.Loans} savings={this.state.Savings} investments={this.state.InvestmentsStocksBonds} otherAssets={this.state.otherAssets} otherDebt={this.state.otherDebt}/>
          </div>
          <form className="WalletEntries">
          <br/> <br/>
          <div className="WalletForm">
          
          {wallets.length>0
          ? (<div className="WalletList">{wallets.map(wallet =>
            < div key={wallet.id}>
            
            <label  htmlFor={wallet.wallet_categories}><FontAwesomeIcon className='icon'  icon={this.icons(wallet.icon)}/>{' '}{wallet.wallet_categories} $: {' '}</label>
            
            <input type='number'  className='input' name={wallet.wallet_categories}  onChange={e=>this.handleNetworth(e)}></input><br/><br/></div>)}
            <br/>
            </div>)
          :null}
          
          
          
          
          <br/><br/>
          {this.state.showDescription
            ?( <div id='description'>Assets indicate that they earn value over time, while debts lose value OR need to be paid back over time.</div>)
            :(null
            )
          }
          <div className="WalletTitle">
          <button type="submit" className='submitButton' onClick={e=>this.handleSubmit(e)}>Submit</button>
          <br/>
          
          <br/>
          <p>Total Net Worth: {this.state.total}</p>
          <p>{this.state.error}</p>
          </div>
          </div>
        </form>

        </div>
      </div>


    <Resources />
    <div className="chart">
    <Overtime /> 
    {/* <LineChart data={this.state.entries}/> */}
    </div>
    <div className='goalsSection'>
    <GoalsForm/>
    </div>
    </div>
    </ApiContext.Provider>
  );
  }
  return (<div className='loadingpage'> 
  <br/>
    <p>Prepping our financial planning tools...</p>
    <div className="loader"></div>
    </div>)
  }

}

