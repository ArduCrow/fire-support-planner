import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation, Coordinates } from '../models/location.model';
import { of } from 'rxjs';
import { Plugins, Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  selectedLocationImage: string;
  isLoading = false;
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;

  constructor(private modalCtrl: ModalController,
              private http: HttpClient,
              private actionSheetCrl: ActionSheetController,
              private alertCtrl: AlertController) { }

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCrl.create({header: 'Please choose', buttons: [
      {text: 'Auto-locate', handler: () => {
        this.locateUser();
      }},
      {text: 'Select on map', handler: () => {
        this.openMap();
      }},
      {text: 'Cancel', role: 'cancel'},
    ]
  }).then(actionSheetEl => {
    actionSheetEl.present();
  });
}

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition()
    .then(geoPosition => {
      const coordinates: Coordinates = {lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude};
      this.createPlace(coordinates.lat, coordinates.lng);
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      this.showErrorAlert();
    });
  }

  private showErrorAlert() {
    this.alertCtrl.create({header: 'Could not locate', message: 'Please select manually', buttons: ['OK']})
    .then(alertEl => alertEl.present());
  }

  private openMap() {
    this.modalCtrl.create({component: MapModalComponent}).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };
    this.isLoading = true;
    this.getAddress(lat, lng).pipe(
      switchMap(address => {
      pickedLocation.address = address;
      return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
    })
    ).subscribe(staticMapImageUrl => {
      pickedLocation.staticMapImageUrl = staticMapImageUrl;
      this.selectedLocationImage = staticMapImageUrl;
      this.isLoading = false;
      this.locationPick.emit(pickedLocation);
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`
    ).pipe(
      map(geoData => {
      console.log(geoData);
      if (!geoData || !geoData.results || geoData.results.length === 0) {
        return null;
      }
      return geoData.results[0].formatted_address;
      })
    );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    // tslint:disable-next-line: max-line-length
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=satellite&markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`;
  }
}



