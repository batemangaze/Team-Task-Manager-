from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from TTM.database import get_db
from TTM.models import User,UserInput,UserResponse,UserLogin,CurrentUser
from TTM.auth import hash_password,verify_password
from TTM.jwt_handler import create_token,get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router=APIRouter()


@router.get("/users",response_model=list[UserResponse])
def get_users(db:Session=Depends(get_db)):

    users=db.query(User).all()

    return users

@router.get("/me",response_model=UserResponse)
def get_me(db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):

    user=db.query(User).filter(User.user_id==current_user.user_id).first()

    if user is None:
        raise HTTPException(status_code=404,detail="User Not Found")
    
    return user



@router.post("/users",response_model=UserResponse)
def add_user(new_user:UserInput,db:Session=Depends(get_db)):
    
    hashed_password=hash_password(new_user.password)

    user_obj=User(
        name=new_user.name,
        password=hashed_password
    )

    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)

    return user_obj






@router.post("/login")
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user_obj = db.query(User).filter(User.name == form_data.username).first()

    if user_obj is None:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(form_data.password, user_obj.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    token = create_token({"user_id": user_obj.user_id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.put("/users",response_model=UserResponse)
def update_user(user_id:int,updated_user:UserInput,db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):

    user_obj=db.query(User).filter(User.user_id==user_id).first()

    if user_obj is None:
        raise HTTPException(status_code=404,detail="User Not Found")

    if user_obj.user_id!=current_user.user_id:
        raise HTTPException(status_code=403,detail="Not Authorised")

    user_obj.name=updated_user.name


    db.commit()
    db.refresh(user_obj)

    return user_obj


