import { Component, OnInit } from '@angular/core';
import { ComodoService } from '../../services/comodo.service';
import { AuthenticationService } from '../../services/authentication.service';
import { SecureStoreService } from '../../services/storageL.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-alarmes',
  templateUrl: './alarmes.page.html',
  styleUrls: ['./alarmes.page.scss'],
})
export class AlarmesPage implements OnInit {
    // alterCm: FormGroup;
    isSubmitted = false;
    // id: any;
    comodo: any;
    token = null;
    // isActiveValue: any = null;
    // isSyncValue: any = null;
    // isFavoriteValue: any = null;
    //responseInsertSQLite: any = null;
    userID: any;
    user = null;
    idUser = null;
    timoutGetCom: any;
    // tempAjust: any = null;
    // arCondStatus: any = null;
    // luzesStatus: any = null;
    // tomadasStatus: any = null;

    constructor(public toastController: ToastController, private auth: AuthenticationService, private alertCtrl: AlertController, private storage: SecureStoreService, private apiService: ComodoService) { 
      this.comodo = [];
    }

    async ngOnInit() {
      this.user = this.auth.getUser();
      console.log(this.user);
      this.idUser = await this.storage.getIdUser();
      console.log(this.idUser);
      this.token = await this.storage.getToken();
      // this.token = [{token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGEyYTRmYTFkODRmMTdhODkxZDVhOSIsImlhdCI6MTU5NTAyOTYwNSwiZXhwIjoxNjI2NjUyMDA1fQ.2kp-KLy6458Dq6zGgPsygBB_dyRws9BlqSNjbplyzOk'}];
      console.log(this.token);
      this.userID = this.user ? this.user.id : this.idUser[0].idUser;
      // this.userID = '5f0a2a4fa1d84f17a891d5a9';
      // console.log(this.token);
      this.getCom(this.userID, this.token[0].token);
    }
  
    async ionViewWillEnter() {
      this.user = this.auth.getUser();
      console.log(this.user);
      this.idUser = await this.storage.getIdUser();
      console.log(this.idUser);
      this.token = await this.storage.getToken();
      // this.token = [{token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGEyYTRmYTFkODRmMTdhODkxZDVhOSIsImlhdCI6MTU5NTAyOTYwNSwiZXhwIjoxNjI2NjUyMDA1fQ.2kp-KLy6458Dq6zGgPsygBB_dyRws9BlqSNjbplyzOk'}];
      console.log(this.token);
      this.userID = this.user ? this.user.id : this.idUser[0].idUser;
      // this.userID = '5f0a2a4fa1d84f17a891d5a9';
      //console.log(this.token);
      this.getCom(this.userID, this.token[0].token);
      this.timoutGetCom = setInterval(() => {
        console.log(this.token[0].token);
        // console.log(this.userID);
        this.getCom(this.userID, this.token[0].token);
      }, 2000);
    }

    ionViewWillLeave(){
      clearInterval(this.timoutGetCom);
    }

    alterComSQLite(idMongo, comodo, token, nomCom){
      this.apiService.putComodoByIDComodoMongoSQLite(idMongo, comodo, token).subscribe((response) => {
        console.log(response);
      }, async (err) => {
        console.log(err);
        let error = err.error ? err.error.message : err.message;
        const alert = await this.alertCtrl.create({
          header: 'Falha em atualizar o comodo ' + nomCom + ' com o id: ' + idMongo + ' na base local',
          message: 'Erro: ' + error,
          buttons: ['OK']
        });
        await alert.present();
      });
    }
  
    getCom(userID, token){
      this.apiService.getByUserIDMongoDB(userID, token).subscribe( async (response) => {
        console.log(response);
        this.comodo = response;
      }, async (err) => {
        console.log(err);
        // this.presentToast(err.error.message);
        clearInterval(this.timoutGetCom);
        let error = err.error ? err.error.message : err.message;
        const alert = await this.alertCtrl.create({
          header: 'Falha em buscar o comodo',
          message: 'Erro: ' + error,
          buttons: ['OK']
        });
        await alert.present();
      });
    }
  
    insertOrUpdateComSQLite(idCom, comodo, token, nomCom){
      this.apiService.postComodoSQLite(comodo, token).subscribe( async (response) => {
        console.log(response);
        let existTble = false;
        for(let r of response.message){
          console.log(r);
          // if(r.message.indexOf('Coluna ja Existe na base do servidor, Sincronizado com sucesso')){
          if(r.message.indexOf('Existe')){
            existTble = true;
            break;
          }
        }
        console.log(existTble);
        if(existTble){
          this.alterComSQLite(idCom, comodo, token, nomCom);
        }
      }, async (err) => {
        console.log(err);
        let erro = err.message;
        let errors = err.error.errors;
        let messages = err.error.message;
        let teste = [];
        console.log(errors);
        console.log(messages);
  
        if(errors){
          for(let e of errors){
            console.log(e.message);
            teste.push(e.message);
          }
        }
  
        if(messages){
          for(let m of messages){
            console.log(m);
            teste.push(m.message);
          }
        }
  
        teste.push(erro);
        console.log(teste);
        const alert = await this.alertCtrl.create({
          header: 'Falha em sincronizar o comodo ' + nomCom + ' com o id: ' + idCom + ' na base local',
          message: 'Erro: ' + teste,
          buttons: ['OK']
        });
        await alert.present();
      });
    }
  
    async presentToast(msg) {
      const toast = await this.toastController.create({
        message: msg,
        duration: 2000,
        color: 'danger'
      });
      return await toast.present();
    }

}
