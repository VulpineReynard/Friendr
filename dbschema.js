let db = {
  users: [
    {
      userId: 'ddhjh4345bnvdkl4b45l',
      email: 'test@gmail.com',
      handler: 'user',
      createdAt: '2019-11-16T19:59:52.798Z',
      imageUrl: 'image/asdfbnonjesrg/asdfjkhndkvbn',
      bio: 'Hello my name is user, nice to meet you.',
      website: 'https://user.com',
      location: 'London, UK'
    }
  ],
  screams: [
    {
      userHandle: 'user',
      body: 'this is the scream body',
      createdAt: '2019-12-09T18:39:33.034Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      screamId: 'askjdfhjkb35434n33dn3',
      body: 'This is a comment',
      createdAt: '2019-12-09T18:39:33.034Z'
    }
  ],
  notifications: [
    {
      recipient: 'justin',
      sender: 'john',
      read: 'true | false',
      screamId: 'asdkjfhkjoh34jg34jh',
      type: 'like | comment',
      createdAt: '2019-12-09T18:39:33.034Z'
    }
  ]
};

const userDetails = {
  credentials: {
    userId: 'AKJSHDK89234kjHAKJHDLASD',
    email: 'user@gmail.com',
    handle: 'user',
    createdAt: '2019-12-09T18:39:33.034Z',
    imageUrl: 'image/asdfbnonjesrg/asdfjkhndkvbn',
    website: 'https://user.com',
    location: 'London, UK'
   },
   likes: [
     {
       userHandle: 'user',
       screamId: 'hhsjidfhj4h545basd'
     },
     {
       userHandle: 'user',
       screamId: '38934hbfbbkbjh34b54'
     }
   ]
 }