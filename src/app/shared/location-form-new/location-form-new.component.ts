import { Component, Input, OnInit } from '@angular/core';
import { CountryService } from '../../shared-services/countries.service';
import { GlobalEventManagerService } from '../../core/global-event-manager.service';
import { FormGroup } from '@angular/forms';
import _ from 'lodash-es';
import { EnumSifrant } from '../../shared-services/enum-sifrant';
import { MapPin, MapPoint } from '../mapbox-pins/mapbox-pins.component';

@Component({
  selector: 'app-location-form-new',
  templateUrl: './location-form-new.component.html',
  styleUrls: ['./location-form-new.component.scss']
})
export class LocationFormNewComponent implements OnInit {

  @Input()
  form: FormGroup;

  @Input()
  submitted = false;

  // Pin shown on the map; lat/lng live in the form, this only mirrors them
  markers: Array<MapPin> = [];

  codebookStatus = EnumSifrant.fromObject(this.publiclyVisible);

  constructor(
      public countryCodes: CountryService,
      public globalEventsManager: GlobalEventManagerService
  ) { }

  ngOnInit(): void {
    this.syncMarkerFromForm();
    // Keep the pin in step with coordinates typed into the inputs
    this.form.get('facilityLocation.latitude')?.valueChanges.subscribe(() => this.syncMarkerFromForm());
    this.form.get('facilityLocation.longitude')?.valueChanges.subscribe(() => this.syncMarkerFromForm());
  }

  syncMarkerFromForm() {
    const latCtrl = this.form.get('facilityLocation.latitude');
    const lngCtrl = this.form.get('facilityLocation.longitude');
    if (!latCtrl || !lngCtrl) {
      return;
    }
    const lat = this.toNumber(latCtrl.value);
    const lng = this.toNumber(lngCtrl.value);
    this.markers = (lat == null || lng == null) ? [] : [{ position: { lat, lng } }];
  }

  private toNumber(value): number {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const n = Number(value);
    return isNaN(n) ? null : n;
  }

  doShowVillage(): boolean {
    return this.form.get('facilityLocation.address.country').invalid
        || _.isEqual(this.form.get('facilityLocation.address.country').value, {id: 184, code: 'RW', name: 'Rwanda'});
  }

  get publiclyVisible() {
    const obj = {};
    obj['true'] = $localize`:@@locationForm.publiclyVisible.yes:YES`;
    obj['false'] = $localize`:@@locationForm.publiclyVisible.no:NO`;
    return obj;
  }

  placeMarker(position: MapPoint) {
    this.setLatLng(position);
  }

  removeMarker() {
    this.setLatLng(null);
  }

  private setLatLng(position: MapPoint) {
    const latCtrl = this.form.get('facilityLocation.latitude');
    const lngCtrl = this.form.get('facilityLocation.longitude');
    latCtrl.setValue(position ? position.lat : null);
    lngCtrl.setValue(position ? position.lng : null);
    latCtrl.markAsDirty();
    lngCtrl.markAsDirty();
  }

}
