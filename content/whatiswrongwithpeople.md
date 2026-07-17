+++
title = "Academic Prowess"
date = 2026-07-17
draft = false

[taxonomies]
categories = ["blog"]
tags = []
+++

## Introduction to hell
Academic infrastructure so bad you realise you were better off with a low tier DU college.

Welcome to Amity, An institution who made applying and selecting for course so hard you end up crashing out first day your new semester/year starts.

Lemme start with the [student portal](www.s.amizone.net) they took pride in.
A generic page that would fail twice while logging in because they didnt add a select delay on the login button to wait before cloudflare verifies the user is legitimate. 
To be more specific the function is function validateToken(event) { event.preventDefault(); … } (line 112–113). Since event is undefined, event.preventDefault() throws TypeError on the very first line, before any of the "please interact with the page" / "please complete the CAPTCHA" checks run. Which i really dont know if its a human mistake or vibe coded but i would argue that this website has existed before vibe coding was a thing, maybe it was a recent addition but i dont have enough archive data to verify. 

Honestly im surprised they managed to add cloudflare on the site in a ASP.NET MVC + SQL Server which the evidence says its built on. It is a legacy stack, which means they havent migrated it on modern setup leaving them vulnerable to attacks, not that i could find anything much exploitable. 

See the thing is i dont blame a university that has been around long before i was born to use a stack like this, But its 2026, We live in an era where *everyone* can build decent to enterprise level stuff in < month and push it to prod making it effecient and accessible to everyone, and in this case the students. 

The backend is adequate for a university but the frontend? yeah, dont get me started on it. How can a multi figure univeristy fuck up this bad, A university which takes pride in their infrastructure and QOL.

Alright, for the sake of cutting some slack since everything apperently "works", There's a section in the website called the **Academic Planning Worksheet**. This section of the website was the worst of it all.

Every new semester or year youre supposed to fill out to get ur classes alloted. Naturally it has a bunch of options which are indexed from backend. The index process is so bad it takes exactly 1.3 minutes to load APW under normal network conditions. On a good day by the way. If the traffic is high, The APW section of the website does NOT open. It either gives failure to process or straight up backend errors on frontend. Brutal.

This website doesnt even save timed sessions, Everytime u reload to get rid of the errors, it takes you right back to the login page and then u gotta go through the whole process again. Amazing aint it?

Anyone with 2 braincells would call this dogshit infrastructure considering how amity renounces itself. 

I wanna go into the frontend a bit more. There were a few things i noticed right off the bat when i did a quick recon, not looking for vulnerablities but just seeing whats going on in the background.

## The problems (frontend specfic)

1) No build pipeline, there are not using a bundler.
2) Jquery as a frontend toolkit, its not 2014 man. 
3) Jquery from a third party CDN page, which is a reliablity risk
4) React code pasted into a non react page, They're actually copy pasting shit.

on the 4th point i will give em that, copy pasting is fine as long as u dont FUCK IT UP?

This is all i found in under 10 minutes, anyone with more recon experience would take the website down, thats how bad it is. I mean this all couldve been fixed without risking touching the backend at all.

because believe it or not, there is 0 rate limit or throttling after you pass the login page, which is one of the reasons why the *APW* section of the website is bad at handling requests.

I mean there's blantant proof of deadcode, accessiblity gaps, duplicate lib's and ofcourse the broken captcha.

So why would i rant about it on a blog? This unversity named themselves the top of it all, yet they lack hiring dev's who couldve fixed that a lot easier, even use AI to fix it because why work hard right, I know i dont. 
Hell, they could've just hired their own students, actually not even hire, just give them extra credits for helping out.

In the age of AI and high quality low wage engineers, are we seriously relying on old tech to serve thousand's of students, For a university trying to improve the way people look at them, I'd start from the inside. 

And as much as I'd like to talk about the inside, It's not wise and i could care less because it doesnt concern me and im not the type of person for "raising my voice to do better"

So what was the point? Honestly nothing. Just wanted to make fun of a university who claim they have the "best infrastructure"

Too many quotes man. Too many.

