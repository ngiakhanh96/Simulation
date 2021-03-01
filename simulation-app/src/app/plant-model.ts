import { ICONS } from "./icon-list";

export interface PlantConnection {
  from: string;
  to: string;
  lineId: string;
  order: number;
  imageSrc: string;
  supportReverse: boolean;
  onlyRunFirstTime: boolean;
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
  plantComponents: <PlantComponent[]>[
    {
      id: '1',
      iconId: '27',
      location: {
        x: 38,
        y: 50,
      },
    },
    {
      id: '2',
      iconId: '24',
      location: {
        x: 38,
        y: 317,
      },
    },
    {
      id: '3',
      iconId: '25',
      location: {
        x: 39,
        y: 462,
      },
    },
    {
      id: '4',
      iconId: '28',
      location: {
        x: 35,
        y: 617,
      },
    },
    {
      id: '5',
      iconId: '21',
      location: {
        x: 405,
        y: 317,
      },
    },
    {
      id: '6',
      iconId: '16',
      location: {
        x: 405,
        y: 462,
      },
    },
    {
      id: '7',
      iconId: '20',
      location: {
        x: 405,
        y: 617,
      },
    },
    {
      id: '8',
      iconId: '15',
      location: {
        x: 613,
        y: 182,
      },
    },
    {
      id: '9',
      iconId: '18',
      location: {
        x: 734,
        y: 207,
      },
    },
    {
      id: '10',
      iconId: '19',
      location: {
        x: 750,
        y: 317,
      },
    },
    {
      id: '11',
      iconId: '14',
      location: {
        x: 649,
        y: 600,
      },
    },
    {
      id: '12',
      iconId: '14',
      location: {
        x: 850,
        y: 600,
      },
    },
  ],
  plantConnections: <PlantConnection[]>[
    {
      from: '2',
      to: '5',
      lineId: '1',
      order: 1,
      imageSrc: '../../assets/icons/checklist.svg',
      supportReverse: false,
      onlyRunFirstTime: true
    },
    {
      from: '3',
      to: '6',
      lineId: '2',
      order: 1,
      imageSrc: '../../assets/icons/checklist.svg',
      supportReverse: false,
      onlyRunFirstTime: true
    },
    {
      from: '4',
      to: '7',
      lineId: '3',
      order: 1,
      imageSrc: '../../assets/icons/checklist.svg',
      supportReverse: false,
      onlyRunFirstTime: true
    },
    {
      from: '8',
      to: '1',
      lineId: '4',
      order: 2,
      imageSrc: '../../assets/icons/contract.svg',
      supportReverse: false,
      onlyRunFirstTime: true
    },
    {
      from: '1',
      to: '8',
      lineId: '5',
      order: 3,
      imageSrc: '../../assets/icons/matza.svg',
      supportReverse: false,
      onlyRunFirstTime: true
    },
    {
      from: '11',
      to: '10',
      lineId: '6',
      order: 4,
      imageSrc: '../../assets/icons/matza.svg',
      supportReverse: false,
      onlyRunFirstTime: false
    },
    {
      from: '12',
      to: '10',
      lineId: '7',
      order: 4,
      imageSrc: '../../assets/icons/matza.svg',
      supportReverse: false,
      onlyRunFirstTime: false
    },
    {
      from: '10',
      to: '5',
      lineId: '8',
      order: 5,
      imageSrc: '../../assets/icons/forklift.jpg',
      supportReverse: true,
      onlyRunFirstTime: false
    },
    {
      from: '5',
      to: '6',
      lineId: '9',
      order: 6,
      imageSrc: '../../assets/icons/matza2.svg',
      supportReverse: false,
      onlyRunFirstTime: false
    },
    {
      from: '6',
      to: '7',
      lineId: '10',
      order: 7,
      imageSrc: '../../assets/icons/matza2.svg',
      supportReverse: false,
      onlyRunFirstTime: false
    }
  ],
};
