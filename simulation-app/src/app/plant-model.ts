export interface PlantConnection {
  from: string;
  to: string;
  lineId: string;
  order: number;
  imageSrc: string;
  supportReverse: boolean;
  onlyRunFirstNTime: number | null;
  onlyInMilliseconds: number | null;
  noNeedToWait: boolean;
  forceFollowXAxis: boolean | null;
}

export interface ComponentLocation {
  x: number;
  y: number;
}

export interface PlantComponent {
  id: string;
  iconId: string;
  location: ComponentLocation;
  width: number;
  height: number;
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
        x: 35,
        y: 50,
      },
      width: 100,
      height: 80,
    },
    {
      id: '2',
      iconId: '24',
      location: {
        x: 35,
        y: 317,
      },
      width: 100,
      height: 80,
    },
    {
      id: '3',
      iconId: '25',
      location: {
        x: 35,
        y: 462,
      },
      width: 100,
      height: 80,
    },
    {
      id: '4',
      iconId: '28',
      location: {
        x: 35,
        y: 617,
      },
      width: 100,
      height: 80,
    },
    {
      id: '5',
      iconId: '21',
      location: {
        x: 405,
        y: 317,
      },
      width: 100,
      height: 80,
    },
    {
      id: '6',
      iconId: '16',
      location: {
        x: 405,
        y: 462,
      },
      width: 100,
      height: 80,
    },
    {
      id: '7',
      iconId: '20',
      location: {
        x: 405,
        y: 617,
      },
      width: 100,
      height: 80,
    },
    {
      id: '8',
      iconId: '29',
      location: {
        x: 430,
        y: 690,
      },
      width: 50,
      height: 40,
    },
    {
      id: '9',
      iconId: '15',
      location: {
        x: 613,
        y: 178,
      },
      width: 100,
      height: 80,
    },
    {
      id: '10',
      iconId: '19',
      location: {
        x: 750,
        y: 317,
      },
      width: 100,
      height: 80,
    },
    {
      id: '11',
      iconId: '29',
      location: {
        x: 854,
        y: 284,
      },
      width: 50,
      height: 40,
    },
    {
      id: '12',
      iconId: '29',
      location: {
        x: 776,
        y: 401,
      },
      width: 50,
      height: 40,
    },
    {
      id: '13',
      iconId: '14',
      location: {
        x: 649,
        y: 600,
      },
      width: 100,
      height: 80,
    },
    {
      id: '14',
      iconId: '14',
      location: {
        x: 850,
        y: 600,
      },
      width: 100,
      height: 80,
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
      onlyRunFirstNTime: 1,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '3',
      to: '6',
      lineId: '2',
      order: 1,
      imageSrc: '../../assets/icons/checklist.svg',
      supportReverse: false,
      onlyRunFirstNTime: 1,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '4',
      to: '7',
      lineId: '3',
      order: 1,
      imageSrc: '../../assets/icons/checklist.svg',
      supportReverse: false,
      onlyRunFirstNTime: 1,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '9',
      to: '1',
      lineId: '4',
      order: 2,
      imageSrc: '../../assets/icons/contract.svg',
      supportReverse: false,
      onlyRunFirstNTime: 1,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '1',
      to: '9',
      lineId: '5',
      order: 3,
      imageSrc: '../../assets/icons/matza.svg',
      supportReverse: false,
      onlyRunFirstNTime: 5,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '13',
      to: '10',
      lineId: '6',
      order: 4,
      imageSrc: '../../assets/icons/matza.svg',
      supportReverse: false,
      onlyRunFirstNTime: 3,
      onlyInMilliseconds: null,
      noNeedToWait: true,
      forceFollowXAxis: null,
    },
    {
      from: '14',
      to: '10',
      lineId: '7',
      order: 4,
      imageSrc: '../../assets/icons/matza.svg',
      supportReverse: false,
      onlyRunFirstNTime: 3,
      onlyInMilliseconds: null,
      noNeedToWait: true,
      forceFollowXAxis: null,
    },
    {
      from: '11',
      to: '9',
      lineId: '8',
      order: 4,
      imageSrc: '../../assets/icons/worker.svg',
      supportReverse: true,
      onlyRunFirstNTime: 3,
      onlyInMilliseconds: null,
      noNeedToWait: true,
      forceFollowXAxis: false,
    },
    {
      from: '5',
      to: '12',
      lineId: '9',
      order: 4,
      imageSrc: '../../assets/icons/worker.svg',
      supportReverse: true,
      onlyRunFirstNTime: 3,
      onlyInMilliseconds: null,
      noNeedToWait: true,
      forceFollowXAxis: false,
    },
    {
      from: '10',
      to: '5',
      lineId: '10',
      order: 5,
      imageSrc: '../../assets/icons/forklift.jpg',
      supportReverse: true,
      onlyRunFirstNTime: 2,
      onlyInMilliseconds: null,
      noNeedToWait: true,
      forceFollowXAxis: null,
    },
    {
      from: '5',
      to: '6',
      lineId: '11',
      order: 6,
      imageSrc: '../../assets/icons/matza2.svg',
      supportReverse: false,
      onlyRunFirstNTime: 3,
      onlyInMilliseconds: null,
      noNeedToWait: true,
      forceFollowXAxis: null,
    },
    {
      from: '6',
      to: '7',
      lineId: '12',
      order: 7,
      imageSrc: '../../assets/icons/matza2.svg',
      supportReverse: false,
      onlyRunFirstNTime: 3,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '8',
      to: '4',
      lineId: '13',
      order: 8,
      imageSrc: '../../assets/icons/container-truck.svg',
      supportReverse: false,
      onlyRunFirstNTime: 1,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '4',
      to: '3',
      lineId: '14',
      order: 9,
      imageSrc: '../../assets/icons/container-truck.svg',
      supportReverse: false,
      onlyRunFirstNTime: 1,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
    {
      from: '3',
      to: '2',
      lineId: '15',
      order: 10,
      imageSrc: '../../assets/icons/container-truck.svg',
      supportReverse: false,
      onlyRunFirstNTime: 1,
      onlyInMilliseconds: null,
      noNeedToWait: false,
      forceFollowXAxis: null,
    },
  ],
};
