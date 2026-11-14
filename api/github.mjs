import {json,method,remoteJSON,publicCache,finite} from '../server/http.mjs';
export default async function handler(req,res){
  if(!method(req,res))return;
  const username=process.env.GITHUB_USERNAME?.trim()||'Albatany';if(!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username))return json(res,503,{message:'GitHub is not configured.'});
  const token=process.env.GITHUB_TOKEN?.trim();const headers={Accept:'application/vnd.github+json','User-Agent':'Albatany-Portfolio','X-GitHub-Api-Version':'2022-11-28',...(token?{Authorization:`Bearer ${token}`}:{})};
  try{
    const [profile,repositories]=await Promise.all([remoteJSON(`https://api.github.com/users/${username}`,{headers}),(async()=>{const all=[];for(let page=1;page<=20;page++){const rows=await remoteJSON(`https://api.github.com/users/${username}/repos?type=owner&per_page=100&page=${page}`,{headers});all.push(...rows);if(rows.length<100)break;}return all;})()]);
    let calendar=null;
    if(token)try{const payload=await remoteJSON('https://api.github.com/graphql',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({query:'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date weekday contributionCount contributionLevel}}}}}}',variables:{login:username}})});calendar=payload.data?.user?.contributionsCollection?.contributionCalendar||null;}catch{/* Public repo cards remain available if GraphQL quota/config fails. */}
    const original=repositories.filter(r=>!r.fork&&!r.private);
    const popular=[...original].sort((a,b)=>b.stargazers_count-a.stargazers_count||b.forks_count-a.forks_count||new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,6);
    json(res,200,{profile:{login:profile.login,url:profile.html_url,avatar:profile.avatar_url,bio:profile.bio,followers:finite(profile.followers),repositories:finite(profile.public_repos)},totalStars:original.reduce((n,r)=>n+finite(r.stargazers_count),0),calendar,repositories:popular.map(r=>({name:r.name,description:r.description,url:r.html_url,language:r.language,stars:finite(r.stargazers_count),forks:finite(r.forks_count)})),updatedAt:new Date().toISOString()},publicCache);
  }catch{json(res,502,{message:'GitHub is temporarily unavailable.'});}
}
