from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Team,TeamCreate,TeamResponse,UserResponse,CurrentUser,Membership,User
from jwt_handler import get_current_user



router=APIRouter()


@router.get("/teams",response_model=list[TeamResponse])
def get_my_teams(db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):

    memberships=db.query(Membership).filter(Membership.user_id==current_user.user_id).all()

    teams=[]
    for membership in memberships:
        team=db.query(Team).filter(Team.team_id==membership.team_id).first()

        if team:
            teams.append(team)

    return teams


@router.get("/teams/{team_id}/members",response_model=list[UserResponse])
def get_members(team_id:int,db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):

    team_obj=db.query(Team).filter(Team.team_id==team_id).first()

    if team_obj is None:
        raise HTTPException(status_code=404,detail="Team Not Found")
    
    member_obj=db.query(Membership).filter(Membership.team_id==team_id,Membership.user_id==current_user.user_id).first()

    if member_obj is None:
        raise HTTPException (status_code=403,detail="Member Not In team")
    
    members=db.query(Membership).filter(Membership.team_id==team_id).all()

    users=[]
    for member in members:
        user=db.query(User).filter(User.user_id==member.user_id).first()

        if user:
            users.append(user)
    
    return users


@router.post("/teams",response_model=TeamResponse)
def create_team(new_team:TeamCreate,db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):

    if not new_team.name:
        raise HTTPException(status_code=400, detail="Team name required")

    team_obj=Team(name=new_team.name,owner_id=current_user.user_id)

    db.add(team_obj)
    db.flush()
    new_member=Membership(user_id=current_user.user_id,team_id=team_obj.team_id)
    db.add(new_member)
    db.commit()
    db.refresh(team_obj)

    return team_obj

@router.post("/teams/{team_id}/join")
def join_team(team_id:int,db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):
    
    team_obj=db.query(Team).filter(Team.team_id==team_id).first()

    if team_obj is None:
        raise HTTPException(status_code=404,detail="Team not found or doesnt exist")
    
    member_obj=db.query(Membership).filter(Membership.user_id==current_user.user_id, Membership.team_id==team_id).first()

    if member_obj is not None:
        raise HTTPException(status_code=400,detail="Already In Team")
    
    new_member=Membership(user_id=current_user.user_id,team_id=team_id)

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {"Member":"Added"}


@router.delete("/teams/{team_id}/leave")
def leave_team(team_id:int,db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):

    member_obj=db.query(Membership).filter(Membership.user_id==current_user.user_id, Membership.team_id==team_id).first()

    if member_obj is None:
        raise HTTPException(status_code=404,detail="You are not in this team")

    db.delete(member_obj)
    db.commit()

    return {"message":"Left team successfully"}
