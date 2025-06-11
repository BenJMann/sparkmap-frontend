import { useState, useEffect, useContext } from "react"

import { useNavigate, Navigate } from "react-router-dom"

import { LoginContext } from "../LoginProvider"

import loginTiles from '../Images/loginTiles.png'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import chatSmarter from '../Images/chatSmarter.png'
import brainstorm from '../Images/brainstorm.png'
import planYourLife from '../Images/planYourLife.png'
import todos from '../Images/todos.png'
import dictate from '../Images/dictate.png'
import notes from '../Images/notes.png'
import heatOfTheMoment from '../Images/heatOfTheMoment.png'
import growWithIntention from '../Images/growWithIntention.png'

function Uses() {
    const uses = [
        {
            title: 'Chat Smarter, Not Harder',
            text: "Ever had a conversation where multiple threads are running concurrently? Sparkmap turns that situation into an artform. Effortlessly jump between ideas, respond to what matters most in the moment, and keep the conversation flowing without losing your place. It's conversation, organized — in real time.",
            image: chatSmarter
        },
        {
            title: 'Brainstorm Without Bounds',
            text: "Ideas don’t always come in order — and they shouldn’t have to. SparkMap lets you capture every thought as it comes, organize later, and keep momentum going. Branch off, explore tangents, and build on ideas collaboratively, without interrupting the flow.",
            image: brainstorm
        },
        {
            title: 'Plan Your Life, Your Way',
            text: "Big dreams, daily tasks, and everything in between — SparkMap helps you connect the dots. Map out goals, break them into actionable steps, and adapt as life evolves. Zoom out for the big picture or dive into the details — all in one fluid space.",
            image: planYourLife
        },
        {
            title: 'To-Dos That Think Like You Do',
            text: "Not all tasks are linear — and neither is SparkMap. Organize your to-dos in context, link them to bigger goals, or break them into threads as they evolve. Prioritize what matters now, and come back to the rest when you’re ready. It’s a to-do list that adapts to your brain, not the other way around.",
            image: todos
        },
        {
            title: 'Dictate with Clarity',
            text: "Transcribe conversations, meetings, or reflections as they happen. SparkMap lets you capture spoken words in real time, organizing them into clear, structured notes. Stay present in the moment — SparkMap handles the writing.",
            image: dictate
        },
        {
            title: 'Notes That Stay Connected',
            text: "Capture ideas, insights, and reminders without losing context. SparkMap lets you take notes that link naturally to your conversations, plans, and projects. No more digging through scattered docs — just smart, searchable notes that live where your thinking happens.",
            image: notes
        },
        {
            title: 'Grow with Intention',
            text: "Whether you're building habits, reflecting on your values, or setting meaningful goals, SparkMap gives your personal growth a place to unfold. Track progress, explore new perspectives, and stay aligned with who you want to become — all in one evolving space.",
            image: growWithIntention
        },
        {
            title: 'Turn Conflict into Clarity',
            text: "After a tough conversation, SparkMap helps you make sense of what happened — and what matters most. Reflect, untangle misunderstandings, and explore new ways to connect with tools inspired by practices like Nonviolent Communication. It’s a space for insight, healing, and growth — one conversation at a time.",
            image: chatSmarter
        },
        {
            title: 'Stay Grounded in the Heat of the Moment',
            text: "When conversations get intense, SparkMap helps you keep your balance. Track each thread as it unfolds, slow down reactive patterns, and respond with clarity — not confusion. Whether you're working through conflict or just trying to be heard, SparkMap gives your communication structure, space, and a chance to move forward.",
            image: heatOfTheMoment
        },
        {
            title: 'Coach with Confidence and Clarity',
            text: "SparkMap helps you guide your clients through meaningful conversations with ease. Capture insights, track progress, and organize session notes in real time — all in one place. Focus on connection and transformation while SparkMap handles the structure and follow-up.",
            image: chatSmarter
        }
    ]
    return (
        <Box sx={{
            backgroundColor: '#eee',
            padding: 10
        }}>
            <Typography variant="h2"
            sx={{pb: 5}}>Uses for SparkMap</Typography>
            {uses.map((use, i) => <Paper key={i} elevation={3} sx={{maxWidth: 900, mt: 4, mb: 10, pr: 2}}>
                <Typography variant="h4"
                sx={{p:2}}><b>{use.title}</b></Typography>
                <Stack direction="row">
                    <img style={{marginRight: 40, padding: '30px'}} 
                    src={use.image} alt="" width={160} height={160} />
                    <Typography sx={{pt: 5}}>{use.text}</Typography>
                </Stack>
            </Paper>)}
        </Box>
        
    )
}

export default Uses