export interface PlantConnection {
  from: string;
  to: string;
  lineId: string;
}

export interface ComponentLocation {
  x: number;
  y: number;
}

export interface PlantComponent {
  id: string;
  iconId: string;
  location: ComponentLocation;
}

export interface PlantModel {
  id: string;
  name: string;
  createdDate: Date;
  plantComponents: PlantComponent[];
  plantConnections: PlantConnection[];
}

export const PlantModel1 = <PlantModel>{
  id: '1001',
  name: 'Plant Model 1',
  createdDate: new Date(),
  plantComponents: [
    {
      id: '3',
      iconId: '13',
      location: {
        x: 0,
        y: 0,
      },
    },
    {
      id: '1',
      iconId: '11',
      location: {
        x: 50,
        y: 50,
      },
    },
    {
      id: '2',
      iconId: '12',
      location: {
        x: 500,
        y: 500,
      },
    },
  ],
  plantConnections: [
    {
      from: '1',
      to: '2',
      lineId: '1111',
    },
  ],
};
