from pydantic import BaseModel
from TTM.database import Base
from sqlalchemy import Column,String,Integer,Boolean,ForeignKey

class User(Base):

    __tablename__="users"

    user_id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    password=Column(String,nullable=False)

class UserInput(BaseModel):
    name:str
    password:str

class UserResponse(BaseModel):
    user_id:int
    name:str

class UserLogin(BaseModel):
    name:str
    password:str

class UserPasswordChange(BaseModel):
    user_id:int
    old_password:str
    new_password:str

class CurrentUser(BaseModel):
    user_id:int


class Task(Base):

    __tablename__="tasks"

    task_id=Column(Integer,primary_key=True,index=True)
    title=Column(String,nullable=False)
    description=Column(String,nullable=False)
    team_id=Column(Integer,ForeignKey("teams.team_id"))
    assigned_to=Column(Integer,ForeignKey("users.user_id"))
    status=Column(Boolean,default=False)

class TaskCreate(BaseModel):
    title:str
    description:str
    team_id:int
    assigned_to:int

class TaskUpdate(BaseModel):
    title:str
    description:str

class TaskResponse(BaseModel):
    task_id:int
    title:str
    description:str
    team_id:int
    assigned_to:int
    status:bool

class TaskStatusUpdate(BaseModel):
    status:bool


class Team(Base):

    __tablename__="teams"

    team_id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    owner_id=Column(Integer,ForeignKey("users.user_id"))

class TeamCreate(BaseModel):

    name:str

class TeamResponse(BaseModel):
    team_id:int
    name:str
    owner_id:int


class Membership(Base):

    __tablename__="memberships"

    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.user_id"))
    team_id=Column(Integer,ForeignKey("teams.team_id"))