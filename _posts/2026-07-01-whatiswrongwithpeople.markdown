---
layout: post
title:  "academic prowess"
date:   2026-06-25 16:39:02 +0000
categories: blog
---

## Introduction to hell
Academic infrastructure so bad you realise you were better off with a low tier DU college.

Welcome to Amity, An institution who made applying and selecting for course so hard you end up crashing out first day your new semester/year starts.

Lemme start with the [student portal](www.s.amizone.net) they took pride in.
A generic page that would fail twice while logging in because they didnt add a select delay on the login button to wait before cloudflare verifies the user is legitimate. 
To be more specific the function is function validateToken(event) { event.preventDefault(); … } (line 112–113). Since event is undefined, event.preventDefault() throws TypeError on the very first line, before any of the "please interact with the page" / "please complete the CAPTCHA" checks run. Which i really dont know if its a human mistake or vibe coded but i would argue that this website has existed before vibe coding was a thing, maybe it was a recent addition but i dont have enough archive data to verify. 

Honestly im surprised they managed to add cloudflare on the site in a ASP.NET MVC + SQL Server which the evidence says its built on. It is a legacy stack, which means they havent migrated it on modern setup leaving them vulnerable to attacks, not that i could find anything much exploitable. 

See the thing is i dont blame a university that has been around long before i was born to use a stack like this, But its 2026, We live in an era where *everyone* can build decent to enterprise level stuff in < month and push it to prod making it effecient and accessible to everyone, and in this case the students. 

The backend is adequate for a university but the frontend? yeah, dont get me started on it. How can a multi figure univeristy fuck up this bad, A university which takes pride in their infrastructure and QOL.

