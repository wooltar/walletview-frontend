import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import { DialogService } from './dialog.service';
declare let require: any;
const Web3 = require('web3');


declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  public ready = false;
  public mainAccountBalance$ = new Subject<number>();
  public accounts$ = new Subject<string[]>();

  constructor(private dialogService: DialogService) {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  async bootstrapWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        console.log('Ethereum browser detected.  !');
        // Request account access if needed
        await window.ethereum.enable();
        this.web3 = window.web3
        this.web3.eth.defaultAccount = this.web3.eth.accounts[0]
        const account = await this.web3.eth.getCoinbase()
        await this.refreshAccounts()

      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log('legagy dapp browser');
      window.web3 = new Web3(this.web3.currentProvider);
      this.web3 = window.web3
      // Acccounts always exposed
      await this.refreshAccounts()
    }
    // Non-dapp browsers...
    else {
      let description = 'Non-Ethereum browser detected. You should consider trying MetaMask!'
      this.dialogService.openDialog('Warning!', description, 'danger')
      console.log(description);
    }
  }

  async refreshAccounts(address?: string) {
    console.log('refressAccounts...')
    try {
      let accs = [];
      if (!address){
        accs = await this.web3.eth.getAccounts()

      } else {
        accs[0] = address;
      }
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return false;
      }
      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        this.accounts$.next(accs);
        this.accounts = accs;
        let balance = await this.getBalance(accs[0])
        this.mainAccountBalance$.next(balance)

      }


      this.ready = true;
    } catch (err) {
      console.log('There was an error fetching your accounts.');
    }
  }
  /**
   * get balacne from a address
   *
   * @param {*} address
   * @returns
   * @memberof Web3Service
   */
  async getBalance(address) {
    let balance = 0;
    if (this.isValid){

      const balanceWei = await this.web3.eth.getBalance(address)
      balance = this.web3.utils.fromWei(balanceWei, 'ether')
    }
    return balance

  }
  /**
   * Check is address is valid address
   *
   * @param {*} address
   * @returns valid is true if is valid and false is not
   * @memberof Web3Service
   */
  isValid(address):boolean{
    const valid = this.web3.utils.isAddress(address)
    return valid;
  }
  
  setMainAccount(address) {
    this.mainAccountBalance$.next(address);
  }
}
