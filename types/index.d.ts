export interface IUser {
  username: string;
  email: string;
  school: string;
  major: string;
  courseReviewNum: number;
  adminAccount: boolean;
}

export interface IToDoColor {
  name: string;
  id: string;
  code: string;
}

export interface IToDoIcon {
  name: string;
  id: string;
  symbol: string;
}

export interface IToDoCategory {
  _id: string;
  name: string;
  user: IUser | string;
  isEditable: boolean;
  color: IColor;
  icon: IIcon;
}

export interface IToDoTask {
  _id: string;
  name: string;
  categoryId: string;
  user: string;
  isCompleted: boolean;
  isEditable: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}
